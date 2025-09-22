import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Download, BarChart3, Filter, Calendar, Languages } from 'lucide-react';
import { toast } from 'sonner';

import { getStats, type StatsResponse } from '@/api/stats/get';
import { getHealthStatus, type HealthCheckResponse } from '@/api/health/get';
import type { Review } from '@/api/review/get';
import { getAllReviews } from '@/api/review/get-all';

export function AnalyticsDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [filters, setFilters] = useState({
    language: 'all',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reviewsData, statsData, healthData] = await Promise.all([
        getAllReviews(),
        getStats(),
        getHealthStatus()
      ]);

      setReviews(reviewsData);
      setStats(statsData);
      setHealthStatus(healthData);

      let filteredReviews = reviewsData;
      
      if (filters.language !== 'all') {
        filteredReviews = filteredReviews.filter(review => 
          review.language?.toLowerCase() === filters.language.toLowerCase()
        );
      }
      
      // Filter by date range
      if (filters.dateRange.from && filters.dateRange.to) {
        filteredReviews = filteredReviews.filter(review => {
          const reviewDate = new Date(review.started_at);
          return reviewDate >= filters.dateRange.from && reviewDate <= filters.dateRange.to;
        });
      }

      setReviews(filteredReviews);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvData = convertReviewsToCSV(reviews);
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-reviews-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  const convertReviewsToCSV = (reviews: Review[]): string => {
    const headers = ['ID', 'Date', 'Language', 'Status', 'Quality Score', 'Feedback Items'];
    const rows = reviews.map(review => [
      review.id,
      new Date(review.started_at).toISOString().split('T')[0],
      review.language || 'Unknown',
      review.status,
      review.result?.quality_score?.toString() || 'N/A',
      review.result?.feedback?.length.toString() || '0'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getCommonIssues = () => {
    const issueCount: Record<string, number> = {};
    
    reviews.forEach(review => {
      if (review.result?.feedback) {
        review.result?.feedback.forEach(item => {
          if (item.issue) {
            issueCount[item.issue] = (issueCount[item.issue] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(issueCount)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); 
  };

  const commonIssues = getCommonIssues();
//   const totalReviews = reviews.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Code Review Analytics</h1>
        <div className="flex items-center gap-4">
          {healthStatus && (
            <Badge 
              variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              <div className={`w-2 h-2 rounded-full ${healthStatus.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              {healthStatus.status}
            </Badge>
          )}
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Language
              </label>
              <Select
                value={filters.language}
                onValueChange={(value) => handleFilterChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {stats && Object.keys(stats.by_language || {}).map(lang => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <DatePickerWithRange
                date={filters.dateRange}
                onChange={(range) => handleFilterChange('dateRange', range)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reviews">Review History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_reviews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  across all languages
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.average_quality_score?.toFixed(1) || 0}/10</div>
                <Progress value={(stats?.average_quality_score || 0) * 10} className="h-2 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Languages</CardTitle>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats ? Object.keys(stats.by_language || {}).length : 0}</div>
                <p className="text-xs text-muted-foreground">
                  different languages reviewed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Common Issues</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commonIssues.length}</div>
                <p className="text-xs text-muted-foreground">
                  top issues identified
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-2">
                  {stats && Object.entries(stats.by_language || {}).map(([language, count]) => (
                    <div key={language} className="flex items-center">
                      <span className="w-20 text-sm font-medium">{language}</span>
                      <Progress 
                        value={(count / stats.total_reviews) * 100} 
                        className="h-2 flex-1" 
                      />
                      <span className="w-12 text-right text-sm text-muted-foreground ml-2">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
                <CardDescription>
                  Most frequently identified issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commonIssues.length > 0 ? (
                    commonIssues.map((issue, index) => (
                      <div key={index} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{issue.issue}</p>
                        </div>
                        <div className="ml-auto font-medium">
                          <Badge variant="secondary">{issue.count} occurrences</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No issues found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
              <CardDescription>
                {reviews.length} reviews matching your filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          {formatDate(new Date(review.started_at))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{review.language || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{review.result?.quality_score?.toFixed(1) || 'N/A'}/10</span>
                            {review.result?.quality_score && (
                              <Progress 
                                value={(review.result?.quality_score || 0) * 10} 
                                className="h-2 w-16" 
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {review.result?.feedback ? review.result?.feedback.length : 0} issues
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No reviews found matching your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}