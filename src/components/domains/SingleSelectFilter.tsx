import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SingleSelectFilterProps {
  title: string;
  options: { value: string; label: string; color?: string }[];
  selectedValue?: string;
  onChange: (value: string | undefined) => void;
  renderOption?: (option: { value: string; label: string; color?: string }) => React.ReactNode;
}

export function SingleSelectFilter({
  title,
  options,
  selectedValue,
  onChange,
  renderOption,
}: SingleSelectFilterProps) {
  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-10 gap-2 bg-secondary/50 border-0 hover:bg-secondary/80",
            selectedValue && "bg-primary/10 hover:bg-primary/20"
          )}
        >
          <span className="text-sm">
            {selectedOption ? selectedOption.label : title}
          </span>
          {selectedValue ? (
            <X
              className="h-3 w-3"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer",
              selectedValue === option.value && "bg-accent"
            )}
          >
            {renderOption ? renderOption(option) : option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
