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
import { cilSearch, cilLink, cilCopy, cilExternalLink } from '@coreui/icons-react';
import axios from 'axios';

const Products = () => {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Mock data for demonstration
  const mockProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 8999.99,
      originalPrice: 9999.99,
      platform: 'shopee',
      image: 'https://via.placeholder.com/150',
      rating: 4.8,
      sold: 1250,
      discount: 10,
      seller: 'Apple Store Official'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      price: 7499.99,
      originalPrice: 8499.99,
      platform: 'amazon',
      image: 'https://via.placeholder.com/150',
      rating: 4.7,
      sold: 890,
      discount: 12,
      seller: 'Samsung Brasil'
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.get(`http://localhost:3000/api/products/search`, {
      //   params: { q: query, platform },
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setProducts(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Erro ao buscar produtos. Tente novamente.');
      setLoading(false);
    }
  };

  const generateLink = async (product) => {
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.post(`http://localhost:3000/api/products/affiliate-link`, {
      //   productId: product.id,
      //   platform: product.platform
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setAffiliateLink(response.data.link);
      
      // Mock affiliate link
      setAffiliateLink(`https://affiliate.link/${product.platform}/${product.id}?ref=user123`);
      setSelectedProduct(product);
      setShowModal(true);
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

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Pesquisar Produtos</strong>
              <span className="small ms-1">Encontre produtos para promover</span>
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
                    <option value="all">Todas Plataformas</option>
                    <option value="shopee">Shopee</option>
                    <option value="amazon">Amazon</option>
                    <option value="mercadolivre">Mercado Livre</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CButton 
                    color="primary" 
                    onClick={handleSearch} 
                    disabled={loading || !query}
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
                      <CTableRow key={product.id}>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CImage
                              src={product.image}
                              width={50}
                              height={50}
                              className="me-3 rounded"
                            />
                            <div>
                              <div className="fw-semibold">{product.name}</div>
                              <div className="small text-muted">{product.seller}</div>
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-bold text-success">
                            R$ {product.price.toFixed(2)}
                          </div>
                          {product.discount > 0 && (
                            <div className="small">
                              <del className="text-muted">R$ {product.originalPrice.toFixed(2)}</del>
                              <CBadge color="danger" className="ms-2">-{product.discount}%</CBadge>
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div>⭐ {product.rating}</div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {product.sold.toLocaleString()}
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
                                onClick={() => window.open(`https://${product.platform}.com`, '_blank')}
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
              )}

              {products.length === 0 && !loading && query && (
                <div className="text-center py-5 text-muted">
                  <p>Nenhum produto encontrado. Tente outra busca.</p>
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
              </div>
              <CInputGroup className="mb-3">
                <CFormInput
                  value={affiliateLink}
                  readOnly
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
