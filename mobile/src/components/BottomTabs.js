
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#1647C5';

export default function BottomTabs({ active, onSearch, onFavorites, onAdmin }) {
  return (
    <View
      style={{
        height: 58,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8ECF3',
        flexDirection: 'row',
      }}
    >
      <TouchableOpacity
        onPress={onSearch}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={active === 'Home' ? BLUE : '#98A3B6'}
        />
        <Text
          style={{
            color: active === 'Home' ? BLUE : '#8792A6',
            fontSize: 10,
            marginTop: 2,
          }}
        >
          Buscar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onFavorites}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons
          name="heart-outline"
          size={20}
          color={active === 'Favorites' ? BLUE : '#98A3B6'}
        />
        <Text
          style={{
            color: active === 'Favorites' ? BLUE : '#8792A6',
            fontSize: 10,
            marginTop: 2,
          }}
        >
          Favoritos
        </Text>
      </TouchableOpacity>

      {onAdmin ? (
        <TouchableOpacity
          onPress={onAdmin}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={active === 'Admin' ? BLUE : '#98A3B6'}
          />
          <Text
            style={{
              color: active === 'Admin' ? BLUE : '#8792A6',
              fontSize: 10,
              marginTop: 2,
            }}
          >
            Admin
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
