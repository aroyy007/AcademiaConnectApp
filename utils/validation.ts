import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required')
    .test(
      'is-edu-email',
      'Must be an East Delta University email',
      (value) => value && value.endsWith('@eastdelta.edu.bd')
    ),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const SignupSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required')
    .test(
      'is-edu-email',
      'Must be an East Delta University email',
      (value) => value && value.endsWith('@eastdelta.edu.bd')
    ),
  semester: Yup.number()
    .required('Semester is required')
    .min(1, 'Semester must be between 1 and 12')
    .max(12, 'Semester must be between 1 and 12'),
  department: Yup.string().required('Department is required'),
  section: Yup.string()
    .required('Section is required')
    .oneOf(['1', '2', '3', '4'], 'Section must be 1, 2, 3, or 4'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});