import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  CContainer,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavTitle,
  CSidebarToggler,
  CHeader,
  CHeaderBrand,
  CHeaderToggler,
  CHeaderNav,
  CNavLink,
  CBadge,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CDropdownDivider,
  CAvatar,
  CFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSpeedometer,
  cilCart,
  cilChartPie,
  cilBullhorn,
  cilMenu,
  cilUser,
  cilSettings,
  cilAccountLogout,
  cilMoon,
  cilSun
} from '@coreui/icons';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

const DefaultLayout = () => {
  const [sidebarShow, setSidebarShow] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  return (
    <div>
      <CSidebar position="fixed" visible={sidebarShow}>
        <CSidebarBrand className="d-none d-md-flex">
          <CIcon icon={cilCart} height={35} />
          <span className="ms-2">Affiliate Pro</span>
        </CSidebarBrand>
        <CSidebarNav>
          <CNavTitle>Menu Principal</CNavTitle>
          <CNavItem>
            <CNavLink as={NavLink} to="/dashboard">
              <CIcon icon={cilSpeedometer} customClassName="nav-icon" />
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink as={NavLink} to="/products">
              <CIcon icon={cilCart} customClassName="nav-icon" />
              Produtos
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink as={NavLink} to="/campaigns">
              <CIcon icon={cilBullhorn} customClassName="nav-icon" />
              Campanhas
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink as={NavLink} to="/analytics">
              <CIcon icon={cilChartPie} customClassName="nav-icon" />
              Análises
            </CNavLink>
          </CNavItem>
        </CSidebarNav>
        <CSidebarToggler
          className="d-none d-lg-flex"
          onClick={() => setSidebarShow(!sidebarShow)}
        />
      </CSidebar>
      
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <CHeader position="sticky" className="mb-4">
          <CContainer fluid>
            <CHeaderToggler
              className="ps-1"
              onClick={() => setSidebarShow(!sidebarShow)}
            >
              <CIcon icon={cilMenu} size="lg" />
            </CHeaderToggler>
            <CHeaderBrand className="mx-auto d-md-none">
              <CIcon icon={cilCart} height={48} />
            </CHeaderBrand>
            <CHeaderNav className="ms-auto">
              <CNavItem>
                <CNavLink onClick={() => setDarkMode(!darkMode)} style={{ cursor: 'pointer' }}>
                  <CIcon icon={darkMode ? cilSun : cilMoon} size="lg" />
                </CNavLink>
              </CNavItem>
              <CBadge color="warning" className="ms-2 me-2">Pro</CBadge>
            </CHeaderNav>
            <CHeaderNav>
              <CDropdown variant="nav-item">
                <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
                  <CAvatar src="https://ui-avatars.com/api/?name=User&background=321FDB&color=fff" size="md" />
                </CDropdownToggle>
                <CDropdownMenu placement="bottom-end">
                  <CDropdownItem>
                    <CIcon icon={cilUser} className="me-2" />
                    Perfil
                  </CDropdownItem>
                  <CDropdownItem>
                    <CIcon icon={cilSettings} className="me-2" />
                    Configurações
                  </CDropdownItem>
                  <CDropdownDivider />
                  <CDropdownItem>
                    <CIcon icon={cilAccountLogout} className="me-2" />
                    Sair
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CHeaderNav>
          </CContainer>
        </CHeader>
        
        <div className="body flex-grow-1 px-3">
          <CContainer lg>
            <Outlet />
          </CContainer>
        </div>
        
        <CFooter>
          <div>
            <span className="ms-1">Affiliate Marketing Pro © 2025</span>
          </div>
          <div className="ms-auto">
            <span className="me-1">Powered by</span>
            <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
              CoreUI React
            </a>
          </div>
        </CFooter>
      </div>
    </div>
  );
};

export default DefaultLayout;
