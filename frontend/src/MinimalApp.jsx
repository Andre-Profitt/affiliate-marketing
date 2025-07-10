import React from 'react';
import { CCard, CCardBody, CCardHeader, CContainer, CRow, CCol, CButton } from '@coreui/react';

function MinimalApp() {
  return (
    <CContainer className="mt-5">
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <strong>CoreUI is Working!</strong>
            </CCardHeader>
            <CCardBody>
              <p>If you can see this styled card, CoreUI is loading correctly.</p>
              <CButton color="primary">Test Button</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}

export default MinimalApp;
