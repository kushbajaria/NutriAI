import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Icon({ name, size = 20, color, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
