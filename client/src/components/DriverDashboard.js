import { connect, getTrips, messages } from '../services/TripService';
import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';

import TripCard from './TripCard';
import { isDriver } from '../services/AuthService';
import { toast } from 'react-toastify';


const updateToast = (trip) => {
  const riderName = `${trip.rider.first_name} ${trip.rider.last_name}`;
  if (trip.driver === null) {
    toast.info(`${riderName} has requested a trip.`);
  }
};

function DriverDashboard (props) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    connect();
    const subscription = messages.subscribe((message) => {
      setTrips(prevTrips => [
        ...prevTrips.filter(trip => trip.id !== message.data.id),
        message.data
      ]);
      updateToast(message.data);
    });
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [setTrips]);

  useEffect(() => {
    const loadTrips = async () => {
      const { response, isError } = await getTrips();
      if (isError) {
        setTrips([]);
      } else {
        setTrips(response.data);
      }
    };
    loadTrips();
  }, []);

  if (!isDriver()) {
    return <Navigate to='/' />;
  }

  const getCurrentTrips = () => {
    return trips.filter(trip => {
      return trip.driver !== null && trip.status !== 'COMPLETED';
    });
  };

  const getRequestedTrips = () => {
    return trips.filter(trip => {
      return trip.status === 'REQUESTED';
    });
  };

  const getCompletedTrips = () => {
    return trips.filter(trip => {
      return trip.status === 'COMPLETED';
    });
  };

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
      </Breadcrumb>

      <TripCard
      title='Current Trip'
      trips={getCurrentTrips()}
      group='driver'
      otherGroup='rider'
      />
      
      <TripCard
      title='Requested Trips'
      trips={getRequestedTrips()}
      group='driver'
      otherGroup='rider'
      />

      <TripCard
      title='Recent Trips'
      trips={getCompletedTrips()}
      group='driver'
      otherGroup='rider'
      />
    </>
  );
}

export default DriverDashboard;
