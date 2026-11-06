
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: selected ? '#1647C5' : '#FFFFFF',
        borderWidth: 1,
        borderColor: selected ? '#1647C5' : '#E4E9F2',
        marginRight: 6,
        marginBottom: 7,
      }}
    >
      <Text
        style={{
          color: selected ? '#FFFFFF' : '#45516A',
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
