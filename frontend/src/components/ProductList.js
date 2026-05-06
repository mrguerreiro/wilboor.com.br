import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ExpandableText from './ExpandableText';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (err) {
                setError('Não foi possível carregar os produtos. Verifique se o servidor está rodando.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return <p>Carregando produtos...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (products.length === 0) {
        return <p>Nenhum produto cadastrado.</p>;
    }

    return (
        <div>
            {products.map(product => (
                <div key={product._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{product.name}</h3>
                    <p><ExpandableText text={product.description} maxLength={80} /></p>
                    <p>R$ {product.price.toFixed(2)}</p>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
