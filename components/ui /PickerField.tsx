import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { ChevronDown, Check, CircleAlert as AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

type PickerItem = {
  label: string;
  value: string;
};

interface PickerFieldProps {
  icon?: React.ReactNode;
  placeholder?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  error?: string | false;
}

export const PickerField = ({
  icon,
  placeholder,
  selectedValue,
  onValueChange,
  items,
  error,
}: PickerFieldProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedItem = items.find(item => item.value === selectedValue);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={() => setModalVisible(true)}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <Text style={[
          styles.selectedValueText,
          !selectedValue && styles.placeholderText
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        
        <ChevronDown size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder || 'Select an option'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === selectedValue && (
                    <Check size={20} color="#3B3C36" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.optionsList}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  pickerButtonError: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    paddingHorizontal: SPACING.md,
  },
  selectedValueText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  modalCloseText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: '#3B3C36',
  },
  optionsList: {
    paddingVertical: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
});
