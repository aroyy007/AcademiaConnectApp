import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase';

export interface Schedule {
  id: string;
  course_id: string;
  instructor_id: string | null;
  semester: number;
  section: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  academic_year: string;
  courses: {
    code: string;
    title: string;
    credits: number;
  };
  profiles?: {
    full_name: string;
  };
}

export interface UserSchedule {
  id: string;
  user_id: string;
  schedule_id: string;
  enrolled_at: string;
  schedules: Schedule;
}

export function useSchedule(userId?: string, semester?: number, section?: string) {
  const [userSchedules, setUserSchedules] = useState<UserSchedule[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserSchedule = async () => {
    if (!userId) return;

    try {
      const { data, error } = await db.schedules.getUserSchedule(userId, semester, section);
      if (error) throw error;
      setUserSchedules(data || []);
    } catch (error) {
      console.error('Error loading user schedule:', error);
    }
  };

  const loadAvailableSchedules = async () => {
    if (!semester || !section) return;

    try {
      const { data, error } = await db.schedules.getAvailableSchedules(semester, section);
      if (error) throw error;
      setAvailableSchedules(data || []);
    } catch (error) {
      console.error('Error loading available schedules:', error);
    }
  };

  const enrollInSchedule = async (scheduleId: string) => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      const { error } = await db.schedules.enrollInSchedule(userId, scheduleId);
      if (error) throw error;

      // Reload user schedule
      await loadUserSchedule();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const unenrollFromSchedule = async (scheduleId: string) => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      const { error } = await db.schedules.unenrollFromSchedule(userId, scheduleId);
      if (error) throw error;

      // Reload user schedule
      await loadUserSchedule();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getScheduleByDay = (dayOfWeek: number) => {
    return userSchedules
      .filter(us => us.schedules.day_of_week === dayOfWeek)
      .sort((a, b) => a.schedules.start_time.localeCompare(b.schedules.start_time));
  };

  const isEnrolled = (scheduleId: string) => {
    return userSchedules.some(us => us.schedule_id === scheduleId);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadUserSchedule(),
      loadAvailableSchedules(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [userId, semester, section]);

  return {
    userSchedules,
    availableSchedules,
    loading,
    enrollInSchedule,
    unenrollFromSchedule,
    getScheduleByDay,
    isEnrolled,
    refresh: () => Promise.all([loadUserSchedule(), loadAvailableSchedules()]),
  };
}