'use client';
import { useParams } from 'next/navigation';
import React from 'react';

const EventDetail = () => {
  const params = useParams<{ id: string }>();
  return <div>{params.id}</div>;
};

export default EventDetail;
