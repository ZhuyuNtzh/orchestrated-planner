
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarEvent } from "@/types";
import { useCalendar } from "@/context/CalendarContext";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  defaultDate?: Date;
}

export function EventForm({ isOpen, onClose, event, defaultDate }: EventFormProps) {
  const { addEvent, updateEvent, deleteEvent } = useCalendar();
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    notes: "",
    color: "#6172AD",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set initial form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        start: format(event.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(event.end, "yyyy-MM-dd'T'HH:mm"),
        notes: event.notes || "",
        color: event.color || "#6172AD",
      });
    } else if (defaultDate) {
      const start = new Date(defaultDate);
      const end = new Date(defaultDate);
      end.setHours(end.getHours() + 1);
      
      setFormData({
        title: "",
        start: format(start, "yyyy-MM-dd'T'HH:mm"),
        end: format(end, "yyyy-MM-dd'T'HH:mm"),
        notes: "",
        color: "#6172AD",
      });
    } else {
      setFormData({
        title: "",
        start: "",
        end: "",
        notes: "",
        color: "#6172AD",
      });
    }
  }, [event, defaultDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start || !formData.end) {
      toast("Error", {
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);
    
    if (endDate <= startDate) {
      toast("Error", {
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const eventData = {
        title: formData.title,
        start: startDate,
        end: endDate,
        notes: formData.notes,
        color: formData.color,
      };
      
      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        await addEvent(eventData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      toast("Error", {
        description: "There was a problem saving your event.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    try {
      setIsLoading(true);
      await deleteEvent(event.id);
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast("Error", {
        description: "There was a problem deleting your event.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {event ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Add title"
                className="form-control"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  name="start"
                  type="datetime-local"
                  value={formData.start}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  name="end"
                  type="datetime-local"
                  value={formData.end}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-10 p-1 form-control"
                />
                <div 
                  className="flex-1 rounded-md h-10 flex items-center px-3 text-sm" 
                  style={{ backgroundColor: formData.color, color: "#fff" }}
                >
                  {formData.color}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add notes or description (optional)"
                className="form-control min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <div className="flex-1"></div>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{event ? "Update" : "Create"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
