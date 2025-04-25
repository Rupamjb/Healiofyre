import { useState, useEffect } from "react";
import { getUserAppointments, updateAppointmentStatus } from "../../services/appointmentService";
import { format, parseISO, isBefore, addHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader, AlertCircle, Clock, Info } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CANCELLATION_WINDOW_HOURS,
  DATE_FORMAT,
  TIME_FORMAT,
  getCancellationPolicyText
} from "@/config/appointmentConfig";

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancellation, setConfirmingCancellation] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getUserAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated]);

  const handleCancelAppointment = async (id: string) => {
    try {
      const updatedAppointment = await updateAppointmentStatus(id, "cancelled");
      if (updatedAppointment) {
        // Update the local state
        setAppointments(appointments.map(appt => 
          appt._id === id ? updatedAppointment : appt
        ));
        
        toast({
          title: "Appointment cancelled",
          description: "Your appointment has been successfully cancelled."
        });
        setConfirmingCancellation(null);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if an appointment is cancellable based on time constraints
  const isCancellable = (appointmentDate: Date) => {
    const now = new Date();
    
    // If appointment is in the past, it's not cancellable
    if (isBefore(appointmentDate, now)) {
      return false;
    }
    
    // If there's a cancellation window, check if we're still within it
    if (CANCELLATION_WINDOW_HOURS > 0) {
      const cancellationDeadline = new Date(appointmentDate);
      cancellationDeadline.setHours(cancellationDeadline.getHours() - CANCELLATION_WINDOW_HOURS);
      return isBefore(now, cancellationDeadline);
    }
    
    // Otherwise, any future appointment can be cancelled
    return true;
  };

  if (!isAuthenticated) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to view your appointments.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-10 w-10 text-medical-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-700">No appointments found</h3>
        <p className="text-gray-500 mt-2">
          You haven't booked any appointments yet.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Appointments</h2>
      
      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Cancellation Policy</AlertTitle>
        <AlertDescription>
          {getCancellationPolicyText()}
        </AlertDescription>
      </Alert>
      
      {appointments.map((appointment) => {
        const doctor = appointment.doctorId || {};
        const appointmentDate = parseISO(appointment.date);
        const formattedDate = format(appointmentDate, DATE_FORMAT);
        const formattedTime = format(appointmentDate, TIME_FORMAT);
        const canCancel = appointment.status !== "cancelled" && isCancellable(appointmentDate);
        
        return (
          <Card key={appointment._id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{doctor.name || "Unknown Doctor"}</CardTitle>
                  <CardDescription>{doctor.specialty || "Specialty not available"}</CardDescription>
                </div>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div>{formattedDate}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Time</div>
                  <div>{formattedTime}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="capitalize">{appointment.status}</div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              {canCancel ? (
                <Dialog open={confirmingCancellation === appointment._id} onOpenChange={(open) => {
                  if (!open) setConfirmingCancellation(null);
                }}>
                  <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                      onClick={() => setConfirmingCancellation(appointment._id)}
                    >
                      Cancel Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your appointment with {doctor.name || "Unknown Doctor"} on {formattedDate} at {formattedTime}?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-md">
                      <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        Please note that frequent cancellations may affect your ability to book appointments with this doctor in the future.
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmingCancellation(null)}>
                        Keep Appointment
                      </Button>
                      <Button 
                        variant="destructive" 
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  Cancel Appointment
                </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : appointment.status !== "cancelled" && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {isBefore(appointmentDate, new Date()) 
                    ? "This appointment has already occurred" 
                    : `Cancellation window has passed`}
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 