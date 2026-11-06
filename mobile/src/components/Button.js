
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function Button({ title, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: '#1647C5',
          padding: 15,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
