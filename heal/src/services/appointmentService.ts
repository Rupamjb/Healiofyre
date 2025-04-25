import axios from 'axios';
import { authHeader, API_URL } from './authService';
import { Doctor } from './doctorService';

export interface Appointment {
  _id: string;
  doctorId: Doctor | string;
  userId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentResponse {
  success: boolean;
  data: Appointment;
}

export interface AppointmentsResponse {
  success: boolean;
  count: number;
  data: Appointment[];
}

// Create a new appointment
export const bookAppointment = async (doctorId: string, date: string): Promise<Appointment> => {
  try {
    const response = await axios.post<AppointmentResponse>(
      `${API_URL}/appointments`,
      { doctorId, date },
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    throw new Error(error.response?.data?.error || 'Failed to book appointment');
  }
};

// Get all appointments for the current user
export const getUserAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await axios.get<AppointmentsResponse>(
      `${API_URL}/appointments`,
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Get appointment by ID
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  try {
    const response = await axios.get<AppointmentResponse>(
      `${API_URL}/appointments/${id}`,
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return null;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<Appointment | null> => {
  try {
    const headers = authHeader();
    console.log('Sending request to update appointment status:', {
      url: `${API_URL}/appointments/${id}`,
      method: 'PATCH',
      headers,
      data: { status }
    });
    
    const response = await axios.patch<AppointmentResponse>(
      `${API_URL}/appointments/${id}`,
      { status },
      { 
        headers,
        withCredentials: true
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);
      throw new Error(error.response.data?.error || `Failed to update appointment: ${error.response.status}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response received from server. This might be a CORS or network issue.');
    } else {
      console.error('Request error:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}; 