import React, { useState } from 'react';
import api from '../services/api';

const AddProduct = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', {
                name,
                description,
                price: parseFloat(price),
                images: [image],
            });
            setName('');
            setDescription('');
            setPrice('');
            setImage('');
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
        }
    };

    return (
        <div>
            <h2>Adicionar Produto</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Descrição:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                    <label>Preço:</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                    <label>Imagem (URL):</label>
                    <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />
                </div>
                <button type="submit">Adicionar</button>
            </form>
        </div>
    );
};

export default AddProduct;
