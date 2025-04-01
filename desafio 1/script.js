document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    const productCountElement = document.getElementById('product-count');
    const toggleLayoutButton = document.getElementById('toggle-layout');
    
    let products = [];
    let currentLayout = 'grid-4';
    let isMobile = window.innerWidth <= 768;
    
    // Verifica o tamanho da tela
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Configura o botão de alternar layout
    toggleLayoutButton.addEventListener('click', toggleLayout);
    
    // Inicia o carregamento dos produtos
    fetchProducts();
    
    function checkScreenSize() {
        isMobile = window.innerWidth <= 768;
        currentLayout = isMobile ? 'grid-4' : 'grid-4';
        updateGridLayout();
    }
    
    function toggleLayout() {
        if (isMobile) {
            currentLayout = currentLayout === 'grid-4' ? 'grid-1' : 'grid-4';
        } else {
            currentLayout = currentLayout === 'grid-4' ? 'grid-5' : 'grid-4';
        }
        updateGridLayout();
    }
    
    function updateGridLayout() {
        productGrid.className = 'product-grid ' + currentLayout;
    }
    
    async function fetchProducts() {
        try {
            productGrid.innerHTML = '<div class="loading">Carregando produtos...</div>';
            console.log('Iniciando carregamento de produtos...');
            
            // 1. Busca a lista de produtos
            const searchResponse = await fetch('https://desafio.xlow.com.br/search');
            
            if (!searchResponse.ok) {
                const errorText = await searchResponse.text();
                throw new Error(`Erro na API: ${searchResponse.status} - ${errorText}`);
            }
            
            const productList = await searchResponse.json();
            console.log('Lista de produtos recebida:', productList);
            
            if (!Array.isArray(productList)) {
                throw new Error('A API não retornou um array de produtos');
            }
            
            // 2. Busca detalhes de cada produto
            const productPromises = productList.map(async (product, index) => {
                try {
                    console.log(`Carregando detalhes do produto ${index + 1}/${productList.length}: ${product.productId}`);
                    const productResponse = await fetch(`https://desafio.xlow.com.br/search/${product.productId}`);
                    
                    if (!productResponse.ok) {
                        console.error(`Erro no produto ${product.productId}: ${productResponse.status}`);
                        return null;
                    }
                    
                    const productDetails = await productResponse.json();
                    console.log(`Detalhes do produto ${product.productId}:`, productDetails);
                    
                    return {
                        ...product,
                        ...productDetails
                    };
                } catch (error) {
                    console.error(`Erro no produto ${product.productId}:`, error);
                    return {
                        ...product,
                        error: true
                    };
                }
            });
            
            // 3. Processa os resultados
            products = (await Promise.all(productPromises)).filter(p => p !== null && !p.error);
            console.log('Produtos carregados com sucesso:', products);
            
            if (products.length === 0) {
                throw new Error('Nenhum produto foi carregado com sucesso');
            }
            
            displayProducts(products);
            productCountElement.textContent = `${products.length} produtos`;
            
        } catch (error) {
            console.error('Erro no carregamento:', error);
            productGrid.innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar produtos</p>
                    <p>${error.message}</p>
                    <p>Verifique o console para detalhes</p>
                </div>
            `;
        }
    }
    
    function displayProducts(products) {
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Verifica campos obrigatórios
            if (!product.image) {
                product.image = 'https://via.placeholder.com/300?text=Sem+Imagem';
            }
            
            // Preço e desconto
            let priceElement = 'Preço indisponível';
            if (product.price) {
                const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                if (hasDiscount) {
                    productCard.classList.add('discounted');
                    priceElement = `
                        <span class="original-price">R$ ${product.originalPrice.toFixed(2)}</span>
                        <span>R$ ${product.price.toFixed(2)}</span>
                    `;
                } else {
                    priceElement = `R$ ${product.price.toFixed(2)}`;
                }
            }
            
            // Variações
            let variationImages = '';
            if (product.variations && Array.isArray(product.variations)) {
                variationImages = product.variations
                    .filter(v => v?.image)
                    .map(v => `
                        <img src="${v.image}" 
                             alt="${v.name || ''}" 
                             class="variation-image" 
                             data-main-image="${v.image}">
                    `).join('');
            }
            
            // Monta o card do produto
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" 
                         alt="${product.productName}" 
                         class="product-image">
                </div>
                ${variationImages ? `<div class="product-variations">${variationImages}</div>` : ''}
                <div class="product-info">
                    ${product.brand ? `<div class="brand">${product.brand}</div>` : ''}
                    <h3 class="product-name">${product.productName}</h3>
                    <div class="product-price">${priceElement}</div>
                    <button class="buy-button">COMPRAR</button>
                </div>
            `;
            
            productGrid.appendChild(productCard);
            
            // Eventos para trocar imagens
            const variations = productCard.querySelectorAll('.variation-image');
            const mainImage = productCard.querySelector('.product-image');
            
            variations.forEach(variation => {
                variation.addEventListener('click', () => {
                    mainImage.src = variation.dataset.mainImage;
                });
            });
        });
    }
});
