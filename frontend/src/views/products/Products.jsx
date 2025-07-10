import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CBadge,
  CSpinner,
  CTooltip,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CImage,
  CButtonGroup,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilLink, cilCopy, cilExternalLink } from '@coreui/icons';
import axios from 'axios';

const Products = () => {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('shopee');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:3000/api/affiliate/products/search`, {
        params: { q: query, platform },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setError(response.data.message || 'Erro ao buscar produtos');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        // Redirect to login
        window.location.href = '/login';
      } else if (error.response?.status === 429) {
        setError('Muitas requisições. Aguarde um momento.');
      } else {
        setError('Erro ao buscar produtos. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async (product) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:3000/api/affiliate/links/generate`, {
        productId: product._id,
        url: product.url
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAffiliateLink(response.data.affiliateUrl);
        setSelectedProduct(product);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error generating link:', error);
      setError('Erro ao gerar link de afiliado.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformBadge = (platform) => {
    const badges = {
      shopee: <CBadge color="danger">Shopee</CBadge>,
      amazon: <CBadge color="warning">Amazon</CBadge>,
      mercadolivre: <CBadge color="info">Mercado Livre</CBadge>
    };
    return badges[platform] || <CBadge color="secondary">{platform}</CBadge>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Pesquisar Produtos</strong>
              <span className="small ms-1">Encontre produtos reais para promover</span>
            </CCardHeader>
            <CCardBody>
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError('')}>
                  {error}
                </CAlert>
              )}
              
              <CRow className="g-3 mb-4">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Buscar produtos... (ex: iphone, notebook, fone)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="shopee">Shopee</option>
                    <option value="amazon" disabled>Amazon (em breve)</option>
                    <option value="mercadolivre" disabled>Mercado Livre (em breve)</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CButton 
                    color="primary" 
                    onClick={handleSearch} 
                    disabled={loading || !query || query.length < 2}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <CIcon icon={cilSearch} className="me-2" />
                        Pesquisar
                      </>
                    )}
                  </CButton>
                </CCol>
              </CRow>

              {products.length > 0 && (
                <>
                  <div className="mb-3">
                    <strong>{products.length}</strong> produtos encontrados
                    {products[0]?.source === 'cache' && (
                      <CBadge color="info" className="ms-2">Cache</CBadge>
                    )}
                  </div>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Produto</CTableHeaderCell>
                        <CTableHeaderCell>Preço</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Avaliação</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Vendidos</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Plataforma</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {products.map((product) => (
                        <CTableRow key={product._id || product.external_id}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CImage
                                src={product.image}
                                width={50}
                                height={50}
                                className="me-3 rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50';
                                }}
                              />
                              <div>
                                <div className="fw-semibold text-truncate" style={{ maxWidth: '300px' }}>
                                  {product.name}
                                </div>
                                <div className="small text-muted">
                                  {product.seller?.name || 'Vendedor'}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="fw-bold text-success">
                              {formatPrice(product.price)}
                            </div>
                            {product.original_price && product.original_price > product.price && (
                              <div className="small">
                                <del className="text-muted">{formatPrice(product.original_price)}</del>
                                <CBadge color="danger" className="ms-2">
                                  -{Math.round(product.discount || ((1 - product.price / product.original_price) * 100))}%
                                </CBadge>
                              </div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div>⭐ {product.rating?.toFixed(1) || 'N/A'}</div>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            {product.sold?.toLocaleString('pt-BR') || '0'}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            {getPlatformBadge(product.platform)}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButtonGroup size="sm">
                              <CTooltip content="Gerar Link de Afiliado">
                                <CButton
                                  color="primary"
                                  onClick={() => generateLink(product)}
                                >
                                  <CIcon icon={cilLink} />
                                </CButton>
                              </CTooltip>
                              <CTooltip content="Ver na Loja">
                                <CButton
                                  color="secondary"
                                  onClick={() => window.open(product.url, '_blank')}
                                >
                                  <CIcon icon={cilExternalLink} />
                                </CButton>
                              </CTooltip>
                            </CButtonGroup>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </>
              )}

              {products.length === 0 && !loading && query && (
                <div className="text-center py-5 text-muted">
                  <p>Nenhum produto encontrado para "{query}".</p>
                  <p>Tente outra busca ou verifique a ortografia.</p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader onClose={() => setShowModal(false)}>
          Link de Afiliado Gerado
        </CModalHeader>
        <CModalBody>
          {selectedProduct && (
            <>
              <div className="mb-3">
                <strong>{selectedProduct.name}</strong>
                <div className="text-muted">{formatPrice(selectedProduct.price)}</div>
              </div>
              <CInputGroup className="mb-3">
                <CFormInput
                  value={affiliateLink}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <CButton
                  color={copied ? 'success' : 'primary'}
                  onClick={copyToClipboard}
                >
                  <CIcon icon={cilCopy} className="me-1" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </CButton>
              </CInputGroup>
              <small className="text-muted">
                Este link rastreia suas vendas e garante suas comissões.
                Compartilhe em suas redes sociais ou WhatsApp.
              </small>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Products;
