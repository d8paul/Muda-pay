import { useState } from "react";
import { Search, Calendar, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ReportFiltersProps {
  onSearch: (term: string) => void;
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
  onResetFilters: () => void;
}

const ReportFilters = ({ onSearch, onDateRangeChange, onResetFilters }: ReportFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const handleSearch = () => {
    onSearch(searchTerm);
  };
  
  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    onDateRangeChange(date, endDate);
  };
  
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    onDateRangeChange(startDate, date);
  };
  
  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate(undefined);
    setEndDate(undefined);
    onResetFilters();
  };
  
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <div className="flex-1 min-w-[240px] flex items-center border rounded-md px-3 bg-white">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchInputKeyDown}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSearch}
          className="ml-2"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {startDate && endDate ? (
              <span>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </span>
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 bg-white rounded-md shadow-md space-y-4">
            <div>
              <h3 className="font-medium mb-2">Start Date</h3>
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                className="rounded-md border"
              />
            </div>
            <div>
              <h3 className="font-medium mb-2">End Date</h3>
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                disabled={(date) => startDate ? date < startDate : false}
                className="rounded-md border"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        onClick={handleResetFilters}
        className="gap-2"
      >
        <FilterX className="h-4 w-4" />
        Reset Filters
      </Button>
    </div>
  );
};

export default ReportFilters;
