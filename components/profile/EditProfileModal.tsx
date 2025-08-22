import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { X, Camera, User, Hash, GraduationCap, Upload, Check, UserCheck } from 'lucide-react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { InputField } from '@/components/ui/InputField';
import { PickerField } from '@/components/ui/PickerField';
import { Button } from '@/components/ui/Button';
import { pickImage, takePhoto, validateImageFile, ImagePickerResult } from '@/utils/imageUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EditProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  studentId: Yup.string()
    .matches(/^\d{9}$/, 'Student ID must be exactly 9 digits (e.g., 223016412)')
    .required('Student ID is required'),
  semester: Yup.number()
    .required('Semester is required')
    .min(1, 'Semester must be between 1 and 12')
    .max(12, 'Semester must be between 1 and 12'),
  section: Yup.string()
    .required('Section is required')
    .oneOf(['1', '2', '3', '4'], 'Section must be 1, 2, 3, or 4'),
  isFaculty: Yup.boolean(),
});

const semesterOptions = [
  { label: '1st Semester', value: 1 },
  { label: '2nd Semester', value: 2 },
  { label: '3rd Semester', value: 3 },
  { label: '4th Semester', value: 4 },
  { label: '5th Semester', value: 5 },
  { label: '6th Semester', value: 6 },
  { label: '7th Semester', value: 7 },
  { label: '8th Semester', value: 8 },
  { label: '9th Semester', value: 9 },
  { label: '10th Semester', value: 10 },
  { label: '11th Semester', value: 11 },
  { label: '12th Semester', value: 12 },
];

const sectionOptions = [
  { label: 'Section 1', value: '1' },
  { label: 'Section 2', value: '2' },
  { label: 'Section 3', value: '3' },
  { label: 'Section 4', value: '4' },
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: any;
  onUpdate: (data: any) => void;
}

export const EditProfileModal = ({
  visible,
  onClose,
  userProfile,
  onUpdate
}: EditProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState(userProfile.avatar_url);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleImageUpload = async () => {
    try {
      setImageError(null);

      if (Platform.OS === 'web') {
        // Web: Direct image picker
        const result = await pickImage({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (result) {
          validateImageFile(result, 10);
          setSelectedImage(result);
          setProfileImage(result.uri);
        }
      } else {
        // Mobile: Show options modal
        setShowImageOptions(true);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      setImageError(error.message || 'Failed to select image. Please try again.');
    }
  };

  const handleImageOption = async (option: 'camera' | 'gallery') => {
    setShowImageOptions(false);
    setImageLoading(true);

    try {
      setImageError(null);
      let result: ImagePickerResult | null = null;

      if (option === 'camera') {
        result = await takePhoto({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await pickImage({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (result) {
        validateImageFile(result, 10);
        setSelectedImage(result);
        setProfileImage(result.uri);
      }
    } catch (error: any) {
      console.error('Image selection error:', error);
      setImageError(error.message || 'Failed to select image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      console.log('Updating profile for user:', userProfile.id, 'with data:', {
        full_name: values.name,
        student_id: values.studentId,
        semester: values.semester,
        section: values.section,
        avatar_url: selectedImage,
      });

      const updatedData = {
        full_name: values.name,
        student_id: values.studentId,
        semester: values.semester,
        section: values.section,
        is_faculty: values.isFaculty,
        // Pass the image picker result if a new image was selected
        avatar_url: selectedImage || (profileImage !== userProfile.avatar_url ? profileImage : undefined),
      };

      // Remove undefined values
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key as keyof typeof updatedData] === undefined) {
          delete updatedData[key as keyof typeof updatedData];
        }
      });

      console.log('Final update data:', updatedData);

      onUpdate(updatedData);
      setSuccess(true);
    } catch (error) {
      console.error('Update profile error:', error);
      setImageError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Check size={48} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Profile Updated!</Text>
            <Text style={styles.successMessage}>
              Your profile has been successfully updated.
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Profile Picture Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Profile Picture</Text>
                <View style={styles.imageContainer}>
                  <View style={styles.imagePreview}>
                    {imageLoading ? (
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : (
                      <Image
                        source={{ uri: profileImage }}
                        style={styles.previewImage}
                      />
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImageUpload}
                    disabled={imageLoading}
                  >
                    <Upload size={16} color={COLORS.primary} />
                    <Text style={styles.uploadButtonText}>Choose Photo</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageHint}>
                    Supports JPG, PNG. Max size: 10MB
                  </Text>
                  {selectedImage && (
                    <Text style={styles.selectedFileText}>
                      Selected: {selectedImage.name}
                    </Text>
                  )}
                  {imageError && (
                    <Text style={styles.errorText}>{imageError}</Text>
                  )}
                </View>
              </View>

              {/* Form Section */}
              <Formik
                initialValues={{
                  name: userProfile.full_name || '',
                  studentId: userProfile.student_id || '',
                  semester: userProfile.semester || 1,
                  section: userProfile.section?.toString() || '1',
                  isFaculty: userProfile.is_faculty || false,
                }}
                validationSchema={EditProfileSchema}
                onSubmit={handleSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                  <View style={styles.form}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Full Name *</Text>
                      <InputField
                        icon={<User size={20} color={COLORS.textSecondary} />}
                        placeholder="Enter your full name"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        error={touched.name && errors.name ? String(errors.name) : false}
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Student ID *</Text>
                      <InputField
                        icon={<Hash size={20} color={COLORS.textSecondary} />}
                        placeholder="223016412"
                        value={values.studentId}
                        onChangeText={handleChange('studentId')}
                        onBlur={handleBlur('studentId')}
                        error={touched.studentId && errors.studentId ? String(errors.studentId) : false}
                        keyboardType="numeric"
                        maxLength={9}
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Semester *</Text>
                      <PickerField
                        icon={<GraduationCap size={20} color={COLORS.textSecondary} />}
                        placeholder="Select your semester"
                        selectedValue={values.semester}
                        onValueChange={(value) => setFieldValue('semester', value)}
                        items={semesterOptions.map(item => ({ label: item.label, value: String(item.value) }))}
                        error={touched.semester && errors.semester ? String(errors.semester) : false}
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Section *</Text>
                      <PickerField
                        icon={<Hash size={20} color={COLORS.textSecondary} />}
                        placeholder="Select your section"
                        selectedValue={values.section}
                        onValueChange={(value) => setFieldValue('section', value)}
                        items={sectionOptions}
                        error={touched.section && errors.section ? String(errors.section) : false}
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Faculty Status</Text>
                      <TouchableOpacity
                        style={[
                          styles.facultyToggle,
                          values.isFaculty && styles.facultyToggleActive
                        ]}
                        onPress={() => setFieldValue('isFaculty', !values.isFaculty)}
                      >
                        <UserCheck 
                          size={20} 
                          color={values.isFaculty ? COLORS.primary : COLORS.textSecondary} 
                        />
                        <Text style={[
                          styles.facultyToggleText,
                          values.isFaculty && styles.facultyToggleTextActive
                        ]}>
                          {values.isFaculty ? 'Faculty Member' : 'Student'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                      <Button
                        title="Cancel"
                        variant="outline"
                        onPress={onClose}
                        style={styles.cancelButton}
                      />
                      <Button
                        title="Save Changes"
                        onPress={() => handleSubmit()}
                        loading={loading}
                        style={styles.saveButton}
                      />
                    </View>
                  </View>
                )}
              </Formik>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Options Modal (Mobile) */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageOptionsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Photo</Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.imageOptionsContainer}>
              <TouchableOpacity
                style={styles.imageOption}
                onPress={() => handleImageOption('camera')}
              >
                <Camera size={24} color={COLORS.primary} />
                <Text style={styles.imageOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageOption}
                onPress={() => handleImageOption('gallery')}
              >
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.imageOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxWidth: 500,
    // Fixed height constraints for Android
    maxHeight: Platform.OS === 'android' ? SCREEN_HEIGHT * 0.85 : '90%',
    minHeight: Platform.OS === 'android' ? SCREEN_HEIGHT * 0.6 : 400,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    // Ensure header doesn't flex
    flexShrink: 0,
  },
  title: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    // Remove padding here to avoid double padding
  },
  scrollContent: {
    padding: SPACING.lg,
    // Add bottom padding for better scrolling
    paddingBottom: SPACING.xl,
  },
  imageSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  uploadButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  imageHint: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  selectedFileText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
  },
  fieldContainer: {
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  imageOptionsModal: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  imageOption: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    minWidth: 120,
  },
  imageOptionText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  facultyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  facultyToggleActive: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  facultyToggleText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  facultyToggleTextActive: {
    color: COLORS.primary,
  },
});
