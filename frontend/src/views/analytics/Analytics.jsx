import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButtonGroup,
  CButton,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CWidgetStatsB,
  CProgress,
  CCallout
} from '@coreui/react';
import { CChartLine, CChartBar, CChartPie } from '@coreui/react-chartjs';
import CIcon from '@coreui/icons-react';
import { cilCalendar, cilCloudDownload } from '@coreui/icons';
import axios from 'axios';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [data, setData] = useState({
    overview: {
      totalRevenue: 15678.90,
      totalClicks: 45678,
      conversionRate: 3.2,
      avgOrderValue: 125.50
    },
    chartData: {
      revenue: [1200, 1400, 1100, 1600, 1800, 2100, 2400],
      clicks: [3400, 3600, 3200, 4100, 4300, 4800, 5200],
      conversions: [40, 45, 35, 52, 58, 67, 78]
    },
    topProducts: [
      { name: 'iPhone 15 Pro', clicks: 1234, conversions: 89, revenue: 8901.23, conversionRate: 7.2 },
      { name: 'Samsung Galaxy S24', clicks: 1098, conversions: 67, revenue: 6700.45, conversionRate: 6.1 },
      { name: 'AirPods Pro', clicks: 987, conversions: 56, revenue: 3456.78, conversionRate: 5.7 },
      { name: 'Echo Dot', clicks: 876, conversions: 45, revenue: 2345.67, conversionRate: 5.1 },
      { name: 'Smart TV LG', clicks: 765, conversions: 34, revenue: 4567.89, conversionRate: 4.4 }
    ],
    platformPerformance: {
      whatsapp: { clicks: 15678, conversions: 234, revenue: 5678.90 },
      instagram: { clicks: 23456, conversions: 345, revenue: 7890.12 },
      email: { clicks: 6544, conversions: 123, revenue: 2109.88 }
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.get('http://localhost:3000/api/analytics', {
      //   params: { range: dateRange },
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setData(response.data);
      
      // Using mock data for now
      console.log('Fetching analytics for:', dateRange);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getDateLabels = () => {
    const labels = {
      '7days': ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      '30days': Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      '12months': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    };
    return labels[dateRange] || labels['7days'];
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Análises Detalhadas</strong>
              <div className="d-flex gap-2">
                <CFormSelect
                  size="sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="12months">Últimos 12 meses</option>
                </CFormSelect>
                <CButton color="primary" size="sm">
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  Exportar
                </CButton>
              </div>
            </CCardHeader>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-4"
            progress={{ color: 'success', value: 75 }}
            text="Receita Total"
            title="R$ 15.678,90"
            value="+12% vs período anterior"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-4"
            progress={{ color: 'info', value: 89 }}
            text="Total de Cliques"
            title="45.678"
            value="+5% vs período anterior"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-4"
            progress={{ color: 'warning', value: 67 }}
            text="Taxa de Conversão"
            title="3.2%"
            value="-0.5% vs período anterior"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-4"
            progress={{ color: 'primary', value: 82 }}
            text="Ticket Médio"
            title="R$ 125,50"
            value="+8% vs período anterior"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12} lg={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Tendência de Desempenho</strong>
            </CCardHeader>
            <CCardBody>
              <CChartLine
                style={{ height: '300px' }}
                data={{
                  labels: getDateLabels(),
                  datasets: [
                    {
                      label: 'Receita (R$)',
                      backgroundColor: 'rgba(50, 31, 219, 0.1)',
                      borderColor: '#321FDB',
                      pointBackgroundColor: '#321FDB',
                      data: data.chartData.revenue,
                      yAxisID: 'y'
                    },
                    {
                      label: 'Conversões',
                      backgroundColor: 'rgba(46, 184, 92, 0.1)',
                      borderColor: '#2EB85C',
                      pointBackgroundColor: '#2EB85C',
                      data: data.chartData.conversions,
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
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Receita (R$)'
                      }
                    },
                    y1: {
                      beginAtZero: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Conversões'
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

        <CCol xs={12} lg={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Desempenho por Plataforma</strong>
            </CCardHeader>
            <CCardBody>
              <CChartPie
                style={{ height: '300px' }}
                data={{
                  labels: ['WhatsApp', 'Instagram', 'Email'],
                  datasets: [
                    {
                      backgroundColor: ['#2EB85C', '#E55353', '#F9B115'],
                      data: [
                        data.platformPerformance.whatsapp.revenue,
                        data.platformPerformance.instagram.revenue,
                        data.platformPerformance.email.revenue
                      ]
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
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Produto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cliques</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Conversões</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Taxa de Conversão</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Receita</CTableHeaderCell>
                    <CTableHeaderCell>Desempenho</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {data.topProducts.map((product, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div className="fw-semibold">{product.name}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {product.clicks.toLocaleString()}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {product.conversions}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <span className={`fw-bold ${product.conversionRate > 5 ? 'text-success' : ''}`}>
                          {product.conversionRate}%
                        </span>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <span className="fw-bold">R$ {product.revenue.toFixed(2)}</span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CProgress 
                          thin 
                          color={product.conversionRate > 5 ? 'success' : 'primary'} 
                          value={product.conversionRate * 10} 
                        />
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCallout color="info">
            <strong>Dica:</strong> Produtos com taxa de conversão acima de 5% estão performando muito bem. 
            Considere aumentar o investimento nestes produtos.
          </CCallout>
        </CCol>
      </CRow>
    </>
  );
};

export default Analytics;
