document.addEventListener("DOMContentLoaded", () => {
        const produtosContainer = document.getElementById("produtos");
        const contadorProdutos = document.getElementById("contador-produtos");
        const toggleLayoutBtn = document.getElementById("toggle-layout");
        let layoutAlternado = false;

        async function fetchProdutos() {
            try {
                const response = await fetch("https://desafio.xlow.com.br/search");
                const produtos = await response.json();
                contadorProdutos.textContent = `Total de produtos: ${produtos.length}`;
                renderizarProdutos(produtos);
            } catch (error) {
                console.error("Erro ao buscar produtos", error);
            }
        }

        async function fetchDetalhesProduto(id) {
            try {
                const response = await fetch(`https://desafio.xlow.com.br/search/${id}`);
                return await response.json();
            } catch (error) {
                console.error("Erro ao buscar detalhes do produto", error);
            }
        }

        async function renderizarProdutos(produtos) {
            produtosContainer.innerHTML = "";
            for (const produto of produtos) {
                const detalhes = await fetchDetalhesProduto(produto.productId);
                const item = detalhes[0]?.items[0];
                if (!item) continue;
                
                const preco = item.sellers[0]?.commertialOffer.Price;
                const precoOriginal = item.sellers[0]?.commertialOffer.ListPrice;
                
                const div = document.createElement("div");
                div.className = "produto";
                div.innerHTML = `
                    <img src="${item.images[0].imageUrl}" data-alt-img="${item.images[1]?.imageUrl}" alt="${produto.productName}">
                    <h3>${produto.productName}</h3>
                    <p class="preco">
                        ${precoOriginal > preco ? `<span class="desconto">R$ ${precoOriginal.toFixed(2)}</span> ` : ""}
                        R$ ${preco.toFixed(2)}
                    </p>
                    <button>Comprar</button>
                `;
                div.querySelector("img").addEventListener("click", function () {
                    const temp = this.src;
                    this.src = this.dataset.altImg;
                    this.dataset.altImg = temp;
                });
                produtosContainer.appendChild(div);
            }
        }

        toggleLayoutBtn.addEventListener("click", () => {
            layoutAlternado = !layoutAlternado;
            produtosContainer.style.gridTemplateColumns = layoutAlternado ? "repeat(auto-fill, minmax(250px, 1fr))" : "repeat(auto-fill, minmax(200px, 1fr))";
        });

        fetchProdutos();
    });
