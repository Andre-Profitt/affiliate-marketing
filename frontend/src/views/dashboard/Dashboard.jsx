import React, { useEffect, useState } from 'react';
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CWidgetStatsA,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CProgress,
  CCallout
} from '@coreui/react';
import { CChartBar, CChartLine, CChartDoughnut } from '@coreui/react-chartjs';
import CIcon from '@coreui/icons-react';
import { cilOptions, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    earnings: 1250.50,
    clicks: 3420,
    conversions: 145,
    products: 28,
    topProducts: [],
    chartData: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      earnings: [400, 500, 600, 700, 850, 1250],
      clicks: [2000, 2300, 2800, 3100, 3300, 3420]
    }
  });

  useEffect(() => {
    // Simulate API call - replace with real backend call
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        // const response = await axios.get('http://localhost:3000/api/analytics/summary', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setMetrics(response.data);
        
        // Mock data for now
        setMetrics(prev => ({
          ...prev,
          topProducts: [
            { name: 'iPhone 15 Pro', sales: 45, revenue: 450.50, trend: 'up' },
            { name: 'Samsung Galaxy S24', sales: 38, revenue: 380.25, trend: 'up' },
            { name: 'AirPods Pro', sales: 32, revenue: 120.75, trend: 'down' },
            { name: 'Echo Dot 5', sales: 28, revenue: 95.50, trend: 'up' },
            { name: 'Smart TV LG 50"', sales: 25, revenue: 285.00, trend: 'stable' }
          ]
        }));
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCallout color="info" className="bg-white">
            <strong>Bem-vindo ao seu Dashboard!</strong> Aqui você pode acompanhar o desempenho das suas campanhas de afiliados em tempo real.
          </CCallout>
        </CCol>
      </CRow>

      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={
              <>
                R$ {metrics.earnings.toFixed(2)}{' '}
                <span className="fs-6 fw-normal">
                  (+12.4% <CIcon icon={cilArrowTop} />)
                </span>
              </>
            }
            title="Ganhos Hoje"
            chart={
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      label: 'Ganhos',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: 'transparent',
                      data: [65, 59, 84, 84, 51, 55, 40]
                    }
                  ]
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false }
                  },
                  elements: {
                    line: { borderWidth: 2 },
                    point: { radius: 0 }
                  }
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="info"
            value={
              <>
                {metrics.clicks.toLocaleString()}{' '}
                <span className="fs-6 fw-normal">
                  (+5.2% <CIcon icon={cilArrowTop} />)
                </span>
              </>
            }
            title="Cliques Totais"
            chart={
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: 'transparent',
                      data: [1, 18, 9, 17, 34, 22, 11]
                    }
                  ]
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false }
                  },
                  elements: {
                    line: { borderWidth: 2 },
                    point: { radius: 0 }
                  }
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="warning"
            value={
              <>
                {metrics.conversions}{' '}
                <span className="fs-6 fw-normal">
                  (-2.5% <CIcon icon={cilArrowBottom} />)
                </span>
              </>
            }
            title="Conversões"
            chart={
              <CChartLine
                className="mt-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      backgroundColor: 'rgba(255,255,255,.2)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [78, 81, 80, 45, 34, 12, 40],
                      fill: true
                    }
                  ]
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false }
                  },
                  elements: {
                    line: { borderWidth: 2 },
                    point: { radius: 0 }
                  }
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="success"
            value={
              <>
                {metrics.products}{' '}
                <span className="fs-6 fw-normal">
                  (+4 novos)
                </span>
              </>
            }
            title="Produtos Ativos"
            chart={
              <CChartBar
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      backgroundColor: 'rgba(255,255,255,.2)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [18, 19, 20, 22, 24, 26, 28]
                    }
                  ]
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false }
                  }
                }}
              />
            }
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12} md={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Tendência de Ganhos</strong>
              <CDropdown className="float-end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>Última Semana</CDropdownItem>
                  <CDropdownItem>Último Mês</CDropdownItem>
                  <CDropdownItem>Último Ano</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCardHeader>
            <CCardBody>
              <CChartLine
                style={{ height: '300px' }}
                data={{
                  labels: metrics.chartData.labels,
                  datasets: [
                    {
                      label: 'Ganhos (R$)',
                      backgroundColor: 'rgba(50, 31, 219, 0.1)',
                      borderColor: '#321FDB',
                      pointBackgroundColor: '#321FDB',
                      data: metrics.chartData.earnings
                    },
                    {
                      label: 'Cliques',
                      backgroundColor: 'rgba(57, 159, 255, 0.1)',
                      borderColor: '#399FFF',
                      pointBackgroundColor: '#399FFF',
                      data: metrics.chartData.clicks,
                      yAxisID: 'y1'
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        usePointStyle: true
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Ganhos (R$)'
                      }
                    },
                    y1: {
                      beginAtZero: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Cliques'
                      },
                      grid: {
                        drawOnChartArea: false
                      }
                    }
                  }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Distribuição por Plataforma</strong>
            </CCardHeader>
            <CCardBody>
              <CChartDoughnut
                style={{ height: '300px' }}
                data={{
                  labels: ['Amazon', 'Shopee', 'Mercado Livre'],
                  datasets: [
                    {
                      backgroundColor: ['#321FDB', '#399FFF', '#2EB85C'],
                      data: [45, 35, 20]
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    }
                  }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Top Produtos</strong>
              <CButton color="primary" size="sm" className="float-end">
                Ver Todos
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Produto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Vendas</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Receita</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Tendência</CTableHeaderCell>
                    <CTableHeaderCell>Desempenho</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {metrics.topProducts.map((product, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div className="fw-semibold">{product.name}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {product.sales}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        R$ {product.revenue.toFixed(2)}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {product.trend === 'up' && (
                          <CIcon icon={cilArrowTop} className="text-success" />
                        )}
                        {product.trend === 'down' && (
                          <CIcon icon={cilArrowBottom} className="text-danger" />
                        )}
                        {product.trend === 'stable' && (
                          <span className="text-muted">—</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CProgress thin color="success" value={product.sales} className="mt-2" />
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;
