
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#1647C5';

export default function JobCard({
  vaga,
  favorita,
  onPress,
  onFavorite,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#EAF1FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <Text style={{ color: BLUE, fontSize: 16 }}>
            {vaga.empresa.charAt(0)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#263249', fontSize: 13 }}>
            {vaga.cargo}
          </Text>
          <Text style={{ color: '#8792A6', fontSize: 11 }}>
            {vaga.empresa}
          </Text>
        </View>

        {onFavorite ? (
          <TouchableOpacity onPress={onFavorite} hitSlop={8}>
            <Ionicons
              name={favorita ? 'heart' : 'heart-outline'}
              size={21}
              color={favorita ? BLUE : '#8491A7'}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={{ color: '#8792A6', fontSize: 10, marginTop: 10 }}>
        {vaga.local} · {vaga.modalidade}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 9,
        }}
      >
        <Text style={{ color: '#344B75', fontSize: 11 }}>
          {vaga.salario}
        </Text>
        <Text style={{ color: '#8792A6', fontSize: 10 }}>
          {vaga.tempo}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
