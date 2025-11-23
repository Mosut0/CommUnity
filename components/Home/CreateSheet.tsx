import React from 'react';
import {
  Modal,
  Pressable,
  Animated,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MARKER_COLORS } from '@/constants/Markers';
import { Colors, type ThemeName } from '@/constants/Colors';

type ThemeConfig = (typeof Colors)[ThemeName];
type CreateSheetAction = 'hazard' | 'event' | 'lost' | 'found';

type CreateSheetProps = {
  visible: boolean;
  onRequestClose: () => void;
  onSelectAction: (action: CreateSheetAction) => void;
  uiTheme: ThemeConfig;
  insetsBottom: number;
};

const ACTIONS: {
  action: CreateSheetAction;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}[] = [
  {
    action: 'hazard',
    label: 'Hazard',
    icon: 'alert-circle-outline',
    color: MARKER_COLORS.hazard,
  },
  {
    action: 'event',
    label: 'Event',
    icon: 'calendar-outline',
    color: MARKER_COLORS.event,
  },
  {
    action: 'lost',
    label: 'Lost Item',
    icon: 'help-circle-outline',
    color: MARKER_COLORS.lost,
  },
  {
    action: 'found',
    label: 'Found Item',
    icon: 'checkmark-circle-outline',
    color: MARKER_COLORS.found,
  },
];

export const CreateSheet: React.FC<CreateSheetProps> = ({
  visible,
  onRequestClose,
  onSelectAction,
  uiTheme,
  insetsBottom,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType='fade'
    onRequestClose={onRequestClose}
  >
    <Pressable
      style={[styles.sheetOverlay, { backgroundColor: uiTheme.overlay }]}
      onPress={onRequestClose}
    >
      <Animated.View
        style={[
          styles.createSheet,
          {
            backgroundColor: uiTheme.cardBg,
            borderColor: uiTheme.divider,
            paddingBottom: 20 + insetsBottom,
          },
        ]}
      >
        <Text style={[styles.createTitle, { color: uiTheme.textPrimary }]}>
          Create new...
        </Text>
        <View style={styles.createGrid}>
          {ACTIONS.map(action => (
            <TouchableOpacity
              key={action.action}
              style={[styles.createCell, { backgroundColor: uiTheme.chipBg }]}
              onPress={() => onSelectAction(action.action)}
              activeOpacity={0.85}
              accessibilityRole='button'
            >
              <View
                style={[
                  styles.iconBubbleLg,
                  { backgroundColor: action.color + '22' },
                ]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text
                style={[styles.createCellText, { color: uiTheme.textPrimary }]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  createSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
  },
  createTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  createGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  createCell: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  iconBubbleLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCellText: {
    fontWeight: '600',
  },
});

CreateSheet.displayName = 'CreateSheet';
