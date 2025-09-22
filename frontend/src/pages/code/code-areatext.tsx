import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { createReview } from '@/api/review/post';
import { toast, Toaster } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/codeblock';
import { getReview, type Review, type ReviewStatus } from '@/api/review/get';



export function CodeTextarea() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [reviewResult, setReviewResult] = useState<Review['result']>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
  if (!code.trim()) return;
  
  setIsLoading(true);
  setError(null);
  setReviewStatus('pending');
  
  try {
    // First create the review
    const response = await createReview({
      title: `${language} Code review`,
      code,
      language
    });
    
    console.log('Review created successfully:', response);
    setReviewStatus('in-progress');
    
    const pollReviewStatus = async (reviewId: string) => {
      const maxAttempts = 30; 
      const delay = 2000; 
      let attempts = 0;
      
      const poll = async () => {
        attempts++;
        try {
          const review = await getReview(reviewId);
          console.log('Review status:', review);
          
          setReviewStatus(review.status || 'pending');
          
          if (review.status === 'completed' && review.result) {
            try {
              setReviewResult({
                quality_score: review.result.quality_score || 0,
                feedback: review.result.feedback || "No feedback provided",
                performance_recommendations: review.result.performance_recommendations 
              });
              toast("Your code has been reviewed successfully.");
            } catch (parseError) {
              console.error('Failed to parse review result:', parseError);
              // setReviewResult({
              //   score: 0,
              //   feedback: { "Received review but couldn't parse the results." },
              //   suggestions: []
              // });
            }
            return;
          } else if (review.status === 'failed') {
            setError(review.error_message || 'Rate limit exceeded, wait one hour');
            toast("There was an error reviewing your code.");
            return;
          }
        
          if (attempts < maxAttempts) {
            setTimeout(poll, delay);
          } else {
            setError('Review timed out. Please check back later.');
            setReviewStatus('failed');
            toast("Review is taking longer than expected. Please check back later.");
          }
        } catch (error) {
          console.error('Error polling review status:', error);
          if (attempts < maxAttempts) {
            setTimeout(poll, delay);
          } else {
            setError('Failed to get review status. Please try again later.');
            setReviewStatus('failed');
            toast("Failed to get review status. Please try again later.");
          }
        }
      };
      
      setTimeout(poll, delay);
    };
    
    if (response.data.id) {
      pollReviewStatus(response.data.id);
    } else {
      throw new Error('No review ID returned from createReview');
    }
    
  } catch (error) {
    console.error('Failed to create review:', error);
    setReviewStatus('failed');
    setError('Failed to submit code for review. Rate limit exceeded, please wait one hour.');
    toast("There was an error submitting your code for review.");
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const programmingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
  ];

  const getStatusIcon = () => {
    switch (reviewStatus) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // const getStatusText = () => {
  //   switch (reviewStatus) {
  //     case 'pending':
  //       return 'Pending review';
  //     case 'in-progress':
  //       return 'Review in progress';
  //     case 'completed':
  //       return 'Review completed';
  //     case 'failed':
  //       return 'Review failed';
  //     default:
  //       return '';
  //   }
  // };

  return (
    <div className="grid place-items-center min-h-screen bg-primary-foreground p-4">
      <div className="w-full max-w-3xl gap-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Code Review Submission</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write">
              <div className="relative">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Paste your code here..."
                  className="min-h-[200px] font-mono text-sm pr-28 resize-none"
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <Combobox
                    items={programmingLanguages}
                    onChange={(value) => setLanguage(value)}
                    value={language}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!code.trim() || isLoading}
                    size="icon"
                    className="h-8 w-8"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="min-h-[200px] rounded-md bg-gray-100 p-4">
                {code ? (
                  <CodeBlock code={code} language={language} />
                ) : (
                  <p className="text-gray-500">No code to preview</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {reviewStatus && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <h2 className="font-semibold">Review Status</h2>
            </div>
            <p className="mb-3">{error}</p>
          </div>)}
          {reviewStatus === 'completed' && reviewResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
            <h3 className="font-medium text-lg mb-3 text-green-800">Review Results</h3>
          
            <div className="mb-4">
              <p className="text-green-700">
                <strong>Score:</strong> {reviewResult.quality_score.toFixed()}/10
              </p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${reviewResult.quality_score * 10}%` }}
                ></div>
              </div>
            </div>

            {reviewResult.feedback && reviewResult.feedback.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-green-800 mb-2">Feedback:</h4>
                <div className="space-y-3">
                  {reviewResult.feedback.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-white rounded-md border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.severity === 'high' ? 'bg-red-100 text-red-800' :
                          item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.severity} severity
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">
                        <strong>Issue:</strong> {item.issue}
                      </p>
                      
                      {item.suggestion && (
                        <p className="text-green-700">
                          <strong>Suggestion:</strong> {item.suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviewResult.performance_recommendations && 
            reviewResult.performance_recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-green-800 mb-2">Performance Recommendations:</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-green-700">
                  {reviewResult.performance_recommendations.map((recommendation: string, index: number) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* No feedback case */}
            {(!reviewResult.feedback || reviewResult.feedback.length < 1) && 
            (!reviewResult.performance_recommendations || reviewResult.performance_recommendations.length === 0) && (
              <p className="text-green-700">No issues found! Your code looks great. 🎉</p>
            )}
          </div>
          
        )}
      </div>
      <Toaster />
    </div>
  );
}