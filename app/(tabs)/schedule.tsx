import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { Calendar, Clock } from 'lucide-react-native';

const TAB_BAR_HEIGHT = 72; // Height of the bottom tab bar

// Dummy data for class schedule
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_SLOTS = [
    '8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM',
    '2:00 PM', '3:30 PM', '5:00 PM'
];

// Professional color palette for classes - each class gets a unique color
const CLASS_COLORS = {
    'CSE301': {
        primary: '#2563EB',    // Blue
        light: '#DBEAFE',
        text: '#1E40AF'
    },
    'CSE311': {
        primary: '#059669',    // Emerald
        light: '#D1FAE5',
        text: '#047857'
    },
    'CSE330': {
        primary: '#DC2626',    // Red
        light: '#FEE2E2',
        text: '#B91C1C'
    },
    'CSE350': {
        primary: '#7C3AED',    // Purple
        light: '#EDE9FE',
        text: '#6D28D9'
    },
    'EEE201': {
        primary: '#EA580C',    // Orange
        light: '#FED7AA',
        text: '#C2410C'
    },
    'EEE301': {
        primary: '#0891B2',    // Cyan
        light: '#CFFAFE',
        text: '#0E7490'
    },
    'BBA101': {
        primary: '#BE185D',    // Pink
        light: '#FCE7F3',
        text: '#9D174D'
    },
    'BBA201': {
        primary: '#65A30D',    // Lime
        light: '#ECFCCB',
        text: '#4D7C0F'
    },
    'ENG101': {
        primary: '#7C2D12',    // Brown
        light: '#FED7AA',
        text: '#92400E'
    },
    'LAW101': {
        primary: '#1F2937',    // Gray
        light: '#F3F4F6',
        text: '#374151'
    }
};

const DUMMY_SCHEDULE = {
    'Monday': [
        { id: 'm1', courseCode: 'CSE301', title: 'Database Systems', time: '9:30 AM - 11:00 AM', room: 'Room 405', instructor: 'Dr. Rahman' },
        { id: 'm2', courseCode: 'CSE311', title: 'Algorithms', time: '2:00 PM - 3:30 PM', room: 'Room 302', instructor: 'Prof. Khan' },
    ],
    'Tuesday': [
        { id: 't1', courseCode: 'CSE330', title: 'Web Engineering', time: '8:00 AM - 9:30 AM', room: 'Lab 2', instructor: 'Ms. Fatima' },
        { id: 't2', courseCode: 'CSE350', title: 'Software Engineering', time: '11:00 AM - 12:30 PM', room: 'Room 401', instructor: 'Dr. Haque' },
    ],
    'Wednesday': [
        { id: 'w1', courseCode: 'CSE301', title: 'Database Systems Lab', time: '11:00 AM - 12:30 PM', room: 'Lab 3', instructor: 'Dr. Rahman' },
    ],
    'Thursday': [
        { id: 'th1', courseCode: 'CSE311', title: 'Algorithms', time: '9:30 AM - 11:00 AM', room: 'Room 302', instructor: 'Prof. Khan' },
        { id: 'th2', courseCode: 'CSE330', title: 'Web Engineering Lab', time: '3:30 PM - 5:00 PM', room: 'Lab 1', instructor: 'Ms. Fatima' },
    ],
    'Friday': [
        { id: 'f1', courseCode: 'CSE350', title: 'Software Engineering', time: '12:30 PM - 2:00 PM', room: 'Room 401', instructor: 'Dr. Haque' },
    ],
};

type CourseCardProps = {
    course: {
        id: string;
        courseCode: string;
        title: string;
        time: string;
        room: string;
        instructor: string;
    };
};

const CourseCard = ({ course }: CourseCardProps) => {
    const colors = CLASS_COLORS[course.courseCode as keyof typeof CLASS_COLORS] || CLASS_COLORS['CSE301'];

    return (
        <View style={[styles.courseCard, { backgroundColor: colors.light, borderLeftColor: colors.primary }]}>
            <View style={styles.courseHeader}>
                <View style={[styles.courseCodeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.courseCode, { color: '#FFFFFF' }]}>{course.courseCode}</Text>
                </View>
            </View>
            <Text style={[styles.courseTitle, { color: colors.text }]}>{course.title}</Text>
            <View style={styles.courseDetail}>
                <Clock size={12} color={colors.text} />
                <Text style={[styles.courseDetailText, { color: colors.text }]}>{course.time}</Text>
            </View>
            <Text style={[styles.courseLocation, { color: colors.text }]}>{course.room} • {course.instructor}</Text>
        </View>
    );
};

export default function ScheduleScreen() {
    const [selectedDay, setSelectedDay] = useState<string>('Monday');

    const getTodayClasses = () => {
        const today = new Date().getDay();
        // Convert to our format (0 = Sunday in JS, but we start with Monday)
        const dayIndex = today === 0 ? 4 : today - 1;
        return dayIndex >= 0 && dayIndex < 5 ? WEEKDAYS[dayIndex] : 'Monday';
    };

    React.useEffect(() => {
        setSelectedDay(getTodayClasses());
    }, []);

    // Get unique courses for the color legend
    const getAllUniqueCourses = () => {
        const uniqueCourses = new Set<string>();
        Object.values(DUMMY_SCHEDULE).forEach(daySchedule => {
            daySchedule.forEach(course => {
                uniqueCourses.add(course.courseCode);
            });
        });
        return Array.from(uniqueCourses);
    };

    const uniqueCourses = getAllUniqueCourses();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Class Schedule</Text>
                <View style={styles.calendarIconContainer}>
                    <Calendar size={20} color="#3B3C36" />
                </View>
            </View>

            {/* Main content area */}
            <View style={styles.contentContainer}>
                {/* Color Legend - Compact */}
                <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>Course Colors</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.legendContent}
                    >
                        {uniqueCourses.slice(0, 4).map(courseCode => {
                            const colors = CLASS_COLORS[courseCode as keyof typeof CLASS_COLORS];
                            return (
                                <View key={courseCode} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                    <Text style={styles.legendText}>{courseCode}</Text>
                                </View>
                            );
                        })}
                        {uniqueCourses.length > 4 && (
                            <View style={styles.legendItem}>
                                <Text style={styles.legendMoreText}>+{uniqueCourses.length - 4} more</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Day selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.daySelector}
                    contentContainerStyle={styles.daySelectorContent}
                >
                    {WEEKDAYS.map(day => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayButton,
                                selectedDay === day && styles.selectedDayButton
                            ]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text
                                style={[
                                    styles.dayButtonText,
                                    selectedDay === day && styles.selectedDayButtonText
                                ]}
                            >
                                {day.substring(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Scrollable Classes Section */}
                <ScrollView
                    style={styles.scheduleScrollView}
                    contentContainerStyle={styles.scheduleScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.scheduleSection}>
                        <Text style={styles.sectionTitle}>{selectedDay} Classes</Text>
                        {DUMMY_SCHEDULE[selectedDay as keyof typeof DUMMY_SCHEDULE]?.length > 0 ? (
                            DUMMY_SCHEDULE[selectedDay as keyof typeof DUMMY_SCHEDULE].map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))
                        ) : (
                            <View style={styles.emptySchedule}>
                                <Text style={styles.emptyScheduleText}>No classes scheduled</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* Fixed Weekly Overview at Bottom */}
            <View style={styles.weeklyOverviewContainer}>
                <Text style={styles.weeklyOverviewTitle}>Weekly Overview</Text>
                <View style={styles.weeklyGrid}>
                    {WEEKDAYS.map(day => {
                        const coursesCount = DUMMY_SCHEDULE[day as keyof typeof DUMMY_SCHEDULE]?.length || 0;
                        return (
                            <View key={day} style={styles.weeklyDayCard}>
                                <Text style={styles.weeklyDayText}>{day.substring(0, 3)}</Text>
                                <View
                                    style={[
                                        styles.weeklyCountCircle,
                                        coursesCount === 0 && styles.weeklyCountCircleEmpty
                                    ]}
                                >
                                    <Text style={styles.weeklyCountText}>{coursesCount}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.xl,  // Increased to SPACING.lg for more clearance from notification bar
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xl,
        color: '#3B3C36',
    },
    calendarIconContainer: {
        padding: SPACING.xs,
    },
    contentContainer: {
        flex: 1,
    },
    scheduleScrollView: {
        flex: 1,
    },
    scheduleScrollContent: {
        paddingBottom: SPACING.sm,
    },
    legendContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    legendTitle: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: '#6B7280',
        marginBottom: SPACING.xs,
    },
    legendContent: {
        gap: SPACING.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 4,
        paddingHorizontal: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    legendColor: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: SPACING.xs,
    },
    legendText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: '#3B3C36',
    },
    legendMoreText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: '#6B7280',
    },
    daySelector: {
        marginVertical: SPACING.sm,
        maxHeight: 36,
    },
    daySelectorContent: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.xs,
    },
    dayButton: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minWidth: 50,
        alignItems: 'center',
    },
    selectedDayButton: {
        backgroundColor: '#3B3C36',
        borderColor: '#3B3C36',
    },
    dayButtonText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: '#3B3C36',
    },
    selectedDayButtonText: {
        color: '#FFFFFF',
    },
    scheduleSection: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.md,
        color: '#3B3C36',
        marginBottom: SPACING.sm,
    },
    courseCard: {
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    courseCodeBadge: {
        paddingVertical: 2,
        paddingHorizontal: SPACING.xs,
        borderRadius: BORDER_RADIUS.xs,
    },
    courseCode: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xs,
    },
    courseTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.sm,
        marginBottom: 2,
    },
    courseDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    courseDetailText: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        marginLeft: 4,
    },
    courseLocation: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
    },
    emptySchedule: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    emptyScheduleText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    weeklyOverviewContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: TAB_BAR_HEIGHT + SPACING.sm, // Space above tab bar
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
    },
    weeklyOverviewTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.sm,
        color: '#3B3C36',
        marginBottom: SPACING.sm,
    },
    weeklyGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.xs,
    },
    weeklyDayCard: {
        flex: 1,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: BORDER_RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    weeklyDayText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    weeklyCountCircle: {
        backgroundColor: '#3B3C36',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weeklyCountCircleEmpty: {
        backgroundColor: COLORS.border,
    },
    weeklyCountText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: '#FFFFFF',
    },
});