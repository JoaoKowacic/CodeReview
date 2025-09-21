// Combobox.tsx
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type ComboboxProps = {
  items: { value: string | undefined; label: string | undefined }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  buttonLabel?: string
  width?: string
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = 'Search',
  buttonLabel = 'Search an item...',
  width = 'w-[150px]',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue === value ? '' : selectedValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`${width} justify-between truncate text-primary`}
        >
          <span className="truncate">
            {value
              ? items.find((item) => item.value === value)?.label
              : buttonLabel}
          </span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${width} p-0`}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((item, index) => (
                <CommandItem
                  key={index}
                  value={item.value}
                  onSelect={() => handleSelect(item.value ?? '')}
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
