/*
  # Seed Data for AcademiaConnect

  1. Sample Data
    - Departments
    - Courses
    - Sample schedules
*/

-- Insert departments
INSERT INTO departments (code, name) VALUES
  ('CSE', 'Computer Science & Engineering'),
  ('EEE', 'Electrical & Electronic Engineering'),
  ('BBA', 'Bachelor of Business Administration'),
  ('ENG', 'English'),
  ('LAW', 'Law')
ON CONFLICT (code) DO NOTHING;

-- Insert courses
INSERT INTO courses (code, title, department_id, credits) VALUES
  ('CSE301', 'Database Systems', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('CSE311', 'Algorithms', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('CSE330', 'Web Engineering', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('CSE350', 'Software Engineering', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('EEE201', 'Circuit Analysis', (SELECT id FROM departments WHERE code = 'EEE'), 3),
  ('EEE301', 'Digital Electronics', (SELECT id FROM departments WHERE code = 'EEE'), 3),
  ('BBA101', 'Principles of Management', (SELECT id FROM departments WHERE code = 'BBA'), 3),
  ('BBA201', 'Marketing Management', (SELECT id FROM departments WHERE code = 'BBA'), 3),
  ('ENG101', 'English Composition', (SELECT id FROM departments WHERE code = 'ENG'), 3),
  ('LAW101', 'Constitutional Law', (SELECT id FROM departments WHERE code = 'LAW'), 3)
ON CONFLICT (code) DO NOTHING;

-- Insert sample schedules (Monday = 1, Tuesday = 2, etc.)
INSERT INTO schedules (course_id, semester, section, day_of_week, start_time, end_time, room, academic_year) VALUES
  ((SELECT id FROM courses WHERE code = 'CSE301'), 5, 'A', 1, '09:30', '11:00', 'Room 405', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE311'), 5, 'A', 1, '14:00', '15:30', 'Room 302', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE330'), 5, 'A', 2, '08:00', '09:30', 'Lab 2', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE350'), 5, 'A', 2, '11:00', '12:30', 'Room 401', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE301'), 5, 'A', 3, '11:00', '12:30', 'Lab 3', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE311'), 5, 'A', 4, '09:30', '11:00', 'Room 302', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE330'), 5, 'A', 4, '15:30', '17:00', 'Lab 1', '2023-24'),
  ((SELECT id FROM courses WHERE code = 'CSE350'), 5, 'A', 5, '12:30', '14:00', 'Room 401', '2023-24')
ON CONFLICT DO NOTHING;