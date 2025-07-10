import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CBadge,
  CFormSelect,
  CFormTextarea,
  CProgress,
  CAlert,
  CButtonGroup,
  CTooltip,
  CSpinner,
  CFormCheck,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilMediaPlay,
  cilMediaPause,
  cilChartLine,
  cilShare
} from '@coreui/icons';
import axios from 'axios';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platforms: [],
    products: [],
    schedule: 'immediate'
  });

  // Mock campaigns data
  const mockCampaigns = [
    {
      id: '1',
      name: 'Black Friday 2025',
      description: 'Campanha para produtos de tecnologia',
      status: 'active',
      platforms: ['whatsapp', 'instagram'],
      products: 5,
      clicks: 1234,
      conversions: 45,
      revenue: 4567.89,
      progress: 75,
      createdAt: '2025-07-01'
    },
    {
      id: '2',
      name: 'Volta às Aulas',
      description: 'Material escolar e eletrônicos',
      status: 'paused',
      platforms: ['instagram'],
      products: 3,
      clicks: 890,
      conversions: 23,
      revenue: 2345.67,
      progress: 45,
      createdAt: '2025-06-15'
    },
    {
      id: '3',
      name: 'Dia dos Pais',
      description: 'Presentes e gadgets',
      status: 'completed',
      platforms: ['whatsapp', 'instagram', 'email'],
      products: 8,
      clicks: 2345,
      conversions: 89,
      revenue: 8901.23,
      progress: 100,
      createdAt: '2025-05-20'
    }
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.get('http://localhost:3000/api/campaigns', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setCampaigns(response.data.campaigns);
      
      // Use mock data for now
      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.post('http://localhost:3000/api/campaigns', formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setCampaigns([...campaigns, response.data.campaign]);
      
      // Mock creation
      const newCampaign = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        clicks: 0,
        conversions: 0,
        revenue: 0,
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCampaigns([newCampaign, ...campaigns]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      platforms: [],
      products: [],
      schedule: 'immediate'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <CBadge color="success">Ativa</CBadge>,
      paused: <CBadge color="warning">Pausada</CBadge>,
      completed: <CBadge color="info">Concluída</CBadge>,
      draft: <CBadge color="secondary">Rascunho</CBadge>
    };
    return badges[status] || <CBadge color="secondary">{status}</CBadge>;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab === 'all') return true;
    return campaign.status === activeTab;
  });

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Campanhas</strong>
                <span className="small ms-1">Gerencie suas campanhas de afiliados</span>
              </div>
              <CButton color="primary" onClick={() => setShowModal(true)}>
                <CIcon icon={cilPlus} className="me-2" />
                Nova Campanha
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CNav variant="tabs" className="mb-4">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                    style={{ cursor: 'pointer' }}
                  >
                    Todas ({campaigns.length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'active'}
                    onClick={() => setActiveTab('active')}
                    style={{ cursor: 'pointer' }}
                  >
                    Ativas ({campaigns.filter(c => c.status === 'active').length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'paused'}
                    onClick={() => setActiveTab('paused')}
                    style={{ cursor: 'pointer' }}
                  >
                    Pausadas ({campaigns.filter(c => c.status === 'paused').length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'completed'}
                    onClick={() => setActiveTab('completed')}
                    style={{ cursor: 'pointer' }}
                  >
                    Concluídas ({campaigns.filter(c => c.status === 'completed').length})
                  </CNavLink>
                </CNavItem>
              </CNav>

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <CRow>
                  {filteredCampaigns.map((campaign) => (
                    <CCol xs={12} md={6} lg={4} key={campaign.id} className="mb-4">
                      <CCard className="h-100">
                        <CCardBody>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5>{campaign.name}</h5>
                              {getStatusBadge(campaign.status)}
                            </div>
                            <CButtonGroup size="sm">
                              {campaign.status === 'active' ? (
                                <CTooltip content="Pausar">
                                  <CButton color="warning" variant="ghost">
                                    <CIcon icon={cilMediaPause} />
                                  </CButton>
                                </CTooltip>
                              ) : campaign.status === 'paused' ? (
                                <CTooltip content="Retomar">
                                  <CButton color="success" variant="ghost">
                                    <CIcon icon={cilMediaPlay} />
                                  </CButton>
                                </CTooltip>
                              ) : null}
                              <CTooltip content="Estatísticas">
                                <CButton color="info" variant="ghost">
                                  <CIcon icon={cilChartLine} />
                                </CButton>
                              </CTooltip>
                              <CTooltip content="Compartilhar">
                                <CButton color="primary" variant="ghost">
                                  <CIcon icon={cilShare} />
                                </CButton>
                              </CTooltip>
                            </CButtonGroup>
                          </div>

                          <p className="text-muted small mb-3">{campaign.description}</p>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between text-muted small mb-1">
                              <span>Progresso</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <CProgress value={campaign.progress} color="primary" />
                          </div>

                          <div className="mb-3">
                            <div className="d-flex gap-2">
                              {campaign.platforms.map((platform) => (
                                <CBadge key={platform} color="light" textColor="dark">
                                  {platform}
                                </CBadge>
                              ))}
                            </div>
                          </div>

                          <hr />

                          <CRow className="text-center">
                            <CCol xs={4}>
                              <div className="fw-bold">{campaign.clicks.toLocaleString()}</div>
                              <div className="text-muted small">Cliques</div>
                            </CCol>
                            <CCol xs={4}>
                              <div className="fw-bold">{campaign.conversions}</div>
                              <div className="text-muted small">Conversões</div>
                            </CCol>
                            <CCol xs={4}>
                              <div className="fw-bold text-success">
                                R$ {campaign.revenue.toFixed(2)}
                              </div>
                              <div className="text-muted small">Receita</div>
                            </CCol>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              )}

              {filteredCampaigns.length === 0 && !loading && (
                <div className="text-center py-5 text-muted">
                  <p>Nenhuma campanha encontrada.</p>
                  <CButton color="primary" onClick={() => setShowModal(true)}>
                    Criar Primeira Campanha
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader onClose={() => setShowModal(false)}>
          Nova Campanha
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12}>
              <CFormInput
                label="Nome da Campanha"
                placeholder="Ex: Black Friday 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </CCol>
            <CCol xs={12}>
              <CFormTextarea
                label="Descrição"
                placeholder="Descreva o objetivo da campanha..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </CCol>
            <CCol xs={12}>
              <label className="form-label">Plataformas</label>
              <div className="d-flex gap-3">
                <CFormCheck
                  id="platform-whatsapp"
                  label="WhatsApp"
                  checked={formData.platforms.includes('whatsapp')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, platforms: [...formData.platforms, 'whatsapp'] });
                    } else {
                      setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'whatsapp') });
                    }
                  }}
                />
                <CFormCheck
                  id="platform-instagram"
                  label="Instagram"
                  checked={formData.platforms.includes('instagram')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, platforms: [...formData.platforms, 'instagram'] });
                    } else {
                      setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'instagram') });
                    }
                  }}
                />
                <CFormCheck
                  id="platform-email"
                  label="Email"
                  checked={formData.platforms.includes('email')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, platforms: [...formData.platforms, 'email'] });
                    } else {
                      setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'email') });
                    }
                  }}
                />
              </div>
            </CCol>
            <CCol xs={12}>
              <CFormSelect
                label="Agendamento"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              >
                <option value="immediate">Iniciar Imediatamente</option>
                <option value="scheduled">Agendar para depois</option>
                <option value="recurring">Campanha Recorrente</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreate}>
            Criar Campanha
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Campaigns;
