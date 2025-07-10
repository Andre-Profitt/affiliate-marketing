import React, { useEffect, useState } from 'react';
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CWidgetStatsA
} from '@coreui/react';

const Dashboard = () => {
  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>Dashboard</strong>
            </CCardHeader>
            <CCardBody>
              <p>Welcome to your Affiliate Dashboard!</p>
              <p>If you can see this, the routing is working.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;
