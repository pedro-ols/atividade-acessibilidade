"use strict";

const MODO_CEGUEIRA = false;

let pedidoAtual = {
    tamanho: "50",
    preco: 299.9,
    quantidade: 1,
    total: 299.9,
};

const imagensTamanhos = {
    50: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=150&h=200&fit=crop&crop=center&q=90",
    75: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=150&h=200&fit=crop&crop=center&q=90",
    100: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150&h=200&fit=crop&crop=center&q=90",
};

let passoAtual = 1;
const totalPassos = 4;

function aplicarModoCegueira() {
    if (MODO_CEGUEIRA) {
        document.documentElement.style.filter = "brightness(0) contrast(0)";
        document.body.style.filter = "brightness(0) contrast(0)";

        const overlay = document.createElement("div");
        overlay.id = "modo-cegueira-overlay";
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #000000 !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            display: block !important;
        `;

        document.body.appendChild(overlay);

        anunciar("Modo cegueira total ativado. Tela completamente preta. Use Tab para navegar e Enter/Space para interagir.", true);

        setTimeout(() => {
            const primeiroElementoFocavel = document.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (primeiroElementoFocavel) {
                primeiroElementoFocavel.focus();
            }
        }, 1000);
    }
}

function anunciar(mensagem, urgente = false) {
    const regiaoId = urgente ? "urgent-announcements" : "screen-reader-announcements";
    const regiao = document.getElementById(regiaoId);

    if (regiao) {
        regiao.textContent = "";
        setTimeout(() => {
            regiao.textContent = mensagem;
        }, 100);

        setTimeout(() => {
            regiao.textContent = "";
        }, 5000);
    }

    console.log(`🔊 Anúncio: ${mensagem}`);
}

function anunciarStatus(mensagem) {
    const regiao = document.getElementById("status-announcements");
    if (regiao) {
        regiao.textContent = mensagem;
        setTimeout(() => {
            regiao.textContent = "";
        }, 3000);
    }
}

function focarElemento(elemento) {
    if (elemento) {
        elemento.focus();
        elemento.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function feedbackVisual(elemento, tipo = "sucesso") {
    if (!elemento) return;

    if (tipo === "sucesso") {
        elemento.style.transform = "scale(1.02)";
        elemento.style.transition = "transform 0.2s ease";
        elemento.style.boxShadow = "0 0 0 3px rgba(39, 174, 96, 0.3)";
    } else if (tipo === "erro") {
        elemento.style.borderColor = "#e74c3c";
        elemento.style.backgroundColor = "#fdf2f2";
        elemento.style.boxShadow = "0 0 0 3px rgba(231, 76, 60, 0.3)";
    }

    setTimeout(() => {
        elemento.style.transform = "";
        elemento.style.boxShadow = "";
        if (tipo === "sucesso") {
            elemento.style.transition = "";
        }
    }, 300);
}

function formatarPreco(valor) {
    return valor.toFixed(2).replace(".", ",");
}

function atualizarProgresso(passo) {
    passoAtual = passo;
    const progresso = (passo / totalPassos) * 100;

    const barraProgresso = document.querySelector(".progresso-atual");
    const textoProgresso = document.getElementById("passo-atual");
    const progressBar = document.querySelector(".progresso-form");

    if (barraProgresso) {
        barraProgresso.style.width = `${progresso}%`;
    }

    if (textoProgresso) {
        textoProgresso.textContent = passo;
    }

    if (progressBar) {
        progressBar.setAttribute("aria-valuenow", passo);
    }

    anunciarStatus(`Progresso do formulário: passo ${passo} de ${totalPassos}`);
}

function calcularPrecos() {
    const tamanhoSelecionado = document.querySelector('input[name="tamanho"]:checked');
    const quantidade = parseInt(document.getElementById("quantidade").value) || 1;
    const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked');

    if (!tamanhoSelecionado) return;

    const precoUnitario = parseFloat(tamanhoSelecionado.dataset.preco);
    const subtotal = precoUnitario * quantidade;

    let desconto = 0;
    let totalAvista = subtotal;
    let textoDesconto = "R$ 0,00 (0%)";

    if (pagamentoSelecionado && pagamentoSelecionado.value === "pix") {
        desconto = subtotal * 0.1;
        totalAvista = subtotal - desconto;
        textoDesconto = `R$ ${formatarPreco(desconto)} (10%)`;
    } else {
        totalAvista = subtotal;
        textoDesconto = "R$ 0,00 (sem desconto)";
    }

    const parcelaMensal = subtotal / 6;

    pedidoAtual.tamanho = tamanhoSelecionado.value;
    pedidoAtual.preco = precoUnitario;
    pedidoAtual.quantidade = quantidade;
    pedidoAtual.total = totalAvista;

    const elementos = {
        "produto-selecionado": `Perfume Essence de Suvacu ${pedidoAtual.tamanho}ml`,
        "quantidade-selecionada": `${quantidade} ${quantidade === 1 ? "unidade" : "unidades"}`,
        subtotal: `R$ ${formatarPreco(subtotal)}`,
        desconto: textoDesconto,
        "total-avista": `R$ ${formatarPreco(totalAvista)}`,
        parcelamento: `6x de R$ ${formatarPreco(parcelaMensal)} sem juros`,
        "valor-final": `R$ ${formatarPreco(totalAvista)}`,
    };

    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;

            if (id === "desconto") {
                if (pagamentoSelecionado && pagamentoSelecionado.value === "pix") {
                    elemento.className = "destaque-desconto";
                } else {
                    elemento.className = "sem-desconto";
                }
            }

            if (id.includes("total") || id.includes("valor")) {
                feedbackVisual(elemento, "sucesso");
            }
        }
    });

    const imagemResumo = document.getElementById("imagem-resumo");
    if (imagemResumo && imagensTamanhos[pedidoAtual.tamanho]) {
        imagemResumo.src = imagensTamanhos[pedidoAtual.tamanho];
        imagemResumo.alt = `Perfume Essence de Suvacu ${pedidoAtual.tamanho}ml selecionado no resumo do pedido`;

        imagemResumo.onerror = function () {
            this.style.display = "none";
            console.log("Imagem do resumo não carregou, ocultando...");
        };

        imagemResumo.onload = function () {
            this.style.display = "block";
            console.log("Imagem do resumo carregada com sucesso");
        };
    }

    atualizarProgresso(2);

    return {
        subtotal,
        totalAvista,
        parcelaMensal,
        quantidade,
        tamanho: pedidoAtual.tamanho,
    };
}

function aoMudarQuantidade() {
    const select = document.getElementById("quantidade");
    const quantidade = parseInt(select.value);

    calcularPrecos();

    feedbackVisual(select, "sucesso");

    anunciar(`Quantidade alterada para ${quantidade} ${quantidade === 1 ? "perfume" : "perfumes"}. Total recalculado.`);
}

function aoMudarTamanho(event) {
    const tamanho = event.target.value;
    const preco = parseFloat(event.target.dataset.preco);
    const label = event.target.nextElementSibling;

    calcularPrecos();

    if (label) {
        feedbackVisual(label, "sucesso");
    }

    anunciar(`Tamanho selecionado: ${tamanho} mililitros. Preço unitário: R$ ${formatarPreco(preco)}. Resumo do pedido atualizado.`);

    atualizarProgresso(2);
}

function aoMudarPagamento(event) {
    const tipoPagamento = event.target.value;
    const label = event.target.nextElementSibling;

    calcularPrecos();

    if (label) {
        feedbackVisual(label, "sucesso");
    }

    let mensagem = "";
    if (tipoPagamento === "pix") {
        mensagem = "PIX selecionado. Desconto de 10% aplicado ao pagamento à vista.";
    } else if (tipoPagamento === "cartao") {
        mensagem = "Cartão de crédito selecionado. Parcelamento disponível sem juros.";
    } else if (tipoPagamento === "boleto") {
        mensagem = "Boleto bancário selecionado. Pagamento à vista sem desconto.";
    }

    anunciar(mensagem);
}

function validarCampo(campo) {
    const valor = campo.value.trim();
    const ehObrigatorio = campo.hasAttribute("required");
    const nome = campo.labels?.[0]?.textContent?.replace("*", "").trim() || "Campo";
    const erroElemento = document.getElementById(`erro-${campo.name}`);

    campo.classList.remove("erro");

    if (ehObrigatorio && !valor) {
        campo.classList.add("erro");
        feedbackVisual(campo, "erro");

        if (erroElemento) {
            erroElemento.textContent = `${nome} é obrigatório e deve ser preenchido`;
            erroElemento.style.display = "block";
            erroElemento.setAttribute("role", "alert");
        }

        return false;
    } else if (valor) {
        if (campo.type === "email" && !validarEmail(valor)) {
            campo.classList.add("erro");
            feedbackVisual(campo, "erro");

            if (erroElemento) {
                erroElemento.textContent = "Por favor, digite um e-mail válido";
                erroElemento.style.display = "block";
                erroElemento.setAttribute("role", "alert");
            }

            return false;
        }

        if (campo.name === "cep" && !validarCEP(valor)) {
            campo.classList.add("erro");
            feedbackVisual(campo, "erro");

            if (erroElemento) {
                erroElemento.textContent = "CEP deve ter 8 dígitos no formato 00000-000";
                erroElemento.style.display = "block";
                erroElemento.setAttribute("role", "alert");
            }

            return false;
        }

        if (erroElemento) {
            erroElemento.style.display = "none";
            erroElemento.removeAttribute("role");
        }

        if (ehObrigatorio) {
            campo.style.borderColor = "#27ae60";
            campo.style.boxShadow = "0 0 0 2px rgba(39, 174, 96, 0.2)";
            setTimeout(() => {
                campo.style.borderColor = "";
                campo.style.boxShadow = "";
            }, 1000);
        }

        return true;
    } else {
        if (erroElemento) {
            erroElemento.style.display = "none";
            erroElemento.removeAttribute("role");
        }
        return true;
    }
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCEP(cep) {
    const regex = /^\d{5}-?\d{3}$/;
    return regex.test(cep);
}

function validarFormulario() {
    const camposObrigatorios = document.querySelectorAll("input[required]");
    let camposValidos = 0;
    let primeiroCampoComErro = null;

    camposObrigatorios.forEach((campo) => {
        const valido = validarCampo(campo);
        if (valido) {
            camposValidos++;
        } else if (!primeiroCampoComErro) {
            primeiroCampoComErro = campo;
        }
    });

    const formularioValido = camposValidos === camposObrigatorios.length;

    if (!formularioValido && primeiroCampoComErro) {
        const totalCampos = camposObrigatorios.length;
        const camposComErro = totalCampos - camposValidos;

        anunciar(`Atenção: ${camposComErro} ${camposComErro === 1 ? "campo obrigatório" : "campos obrigatórios"} ${camposComErro === 1 ? "não foi preenchido" : "não foram preenchidos"}. Focando no primeiro campo com erro.`, true);

        focarElemento(primeiroCampoComErro);

        camposObrigatorios.forEach((campo) => {
            if (!campo.value.trim()) {
                feedbackVisual(campo, "erro");
            }
        });

        atualizarProgresso(3);
    } else {
        atualizarProgresso(4);
    }

    return formularioValido;
}

function aplicarMascaraCep(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length > 5) {
        valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    input.value = valor;

    if (valor.length === 9) {
        input.style.borderColor = "#27ae60";
        input.style.boxShadow = "0 0 0 2px rgba(39, 174, 96, 0.2)";
        anunciarStatus("CEP formatado corretamente");
        setTimeout(() => {
            input.style.borderColor = "";
            input.style.boxShadow = "";
        }, 1000);
    }
}

function aplicarMascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 10) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (valor.length > 6) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3");
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
    }

    input.value = valor;

    if (valor.length >= 14) {
        input.style.borderColor = "#27ae60";
        input.style.boxShadow = "0 0 0 2px rgba(39, 174, 96, 0.2)";
        anunciarStatus("Telefone formatado corretamente");
        setTimeout(() => {
            input.style.borderColor = "";
            input.style.boxShadow = "";
        }, 1000);
    }
}

function finalizarPedido() {
    anunciar("Verificando todos os seus dados antes de finalizar...");

    if (!validarFormulario()) {
        return;
    }

    const botao = document.getElementById("finalizar-pedido");
    const textoOriginal = botao.innerHTML;

    botao.disabled = true;
    botao.innerHTML = `<span aria-hidden="true">⏳</span> PROCESSANDO PEDIDO...`;
    botao.style.background = "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)";
    botao.setAttribute("aria-live", "polite");

    anunciar("Processando seu pedido. Aguarde alguns segundos, não feche a página.", true);

    botao.style.animation = "pulse 1s infinite";

    setTimeout(() => {
        mostrarSucesso();
        botao.style.animation = "";
    }, 3000);
}

function mostrarSucesso() {
    const main = document.querySelector("main");
    const secoes = main.querySelectorAll("section:not(#mensagem-sucesso)");

    secoes.forEach((secao, index) => {
        setTimeout(() => {
            secao.style.opacity = "0";
            secao.style.transform = "translateY(-20px)";
            secao.style.transition = "all 0.3s ease";

            setTimeout(() => {
                secao.style.display = "none";
            }, 300);
        }, index * 100);
    });

    const numeroPedido =
        "SIFU" +
        Math.floor(Math.random() * 99999)
            .toString()
            .padStart(5, "0");

    document.getElementById("numero-pedido").textContent = numeroPedido;
    document.getElementById("total-pago").textContent = `R$ ${formatarPreco(pedidoAtual.total)}`;

    setTimeout(() => {
        const mensagemSucesso = document.getElementById("mensagem-sucesso");
        mensagemSucesso.classList.remove("oculto");
        mensagemSucesso.style.display = "block";
        mensagemSucesso.style.opacity = "0";
        mensagemSucesso.style.transform = "translateY(30px)";

        setTimeout(() => {
            mensagemSucesso.style.transition = "all 0.5s ease";
            mensagemSucesso.style.opacity = "1";
            mensagemSucesso.style.transform = "translateY(0)";
        }, 100);

        focarElemento(mensagemSucesso);

        anunciar(
            `Parabéns! Pedido realizado com sucesso! Número do pedido: ${numeroPedido}. Total pago: R$ ${formatarPreco(
                pedidoAtual.total
            )}. Você receberá seu perfume em 3 a 5 dias úteis. Um e-mail de confirmação será enviado com o código de rastreamento.`,
            true
        );
    }, 800);

    console.log("🎉 Pedido finalizado:", pedidoAtual);
}

function novaCompra() {
    anunciar("Recarregando página para nova compra...");
    window.location.reload();
}

function adicionarEfeitosVisuais() {
    const opcoesTamanho = document.querySelectorAll(".opcao-tamanho");
    opcoesTamanho.forEach((opcao) => {
        opcao.addEventListener("mouseenter", function () {
            if (!this.previousElementSibling.checked) {
                this.style.transform = "translateY(-2px)";
                this.style.transition = "transform 0.2s ease";
            }
        });

        opcao.addEventListener("mouseleave", function () {
            if (!this.previousElementSibling.checked) {
                this.style.transform = "";
            }
        });
    });

    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    inputs.forEach((input) => {
        input.addEventListener("focus", function () {
            this.style.transform = "scale(1.02)";
            this.style.transition = "transform 0.2s ease";
            atualizarProgresso(3);
        });

        input.addEventListener("blur", function () {
            this.style.transform = "";
        });
    });
}

function configurarFallbackImagens() {
    const miniFrascos = document.querySelectorAll(".mini-frasco");
    miniFrascos.forEach((img) => {
        img.onerror = function () {
            this.style.display = "none";
            console.log(`Imagem do frasco não carregou: ${this.alt}`);
        };

        img.onload = function () {
            this.style.display = "block";
            console.log(`Imagem do frasco carregada: ${this.alt}`);
        };
    });

    const imagemPrincipal = document.querySelector(".foto-produto");
    if (imagemPrincipal) {
        imagemPrincipal.onerror = function () {
            this.alt = "Imagem do produto não disponível";
            this.style.background = "#f8f9fa";
            console.log("Imagem principal não carregou");
        };
    }

    const fotosClientes = document.querySelectorAll(".foto-cliente");
    fotosClientes.forEach((img) => {
        img.onerror = function () {
            this.style.display = "none";
            console.log(`Foto do cliente não carregou: ${this.alt}`);
        };

        img.onload = function () {
            this.style.display = "block";
            console.log(`Foto do cliente carregada: ${this.alt}`);
        };
    });
}

function configurarNavegacaoTeclado() {
    document.addEventListener("keydown", function (e) {
        if (e.key === "Tab") {
            document.body.classList.add("usando-teclado");
        }

        if (e.key === "Escape") {
            const elementoFocado = document.activeElement;
            if (elementoFocado && elementoFocado.blur) {
                elementoFocado.blur();
                anunciarStatus("Foco removido do elemento atual");
            }
        }
    });

    document.addEventListener("mousedown", function () {
        document.body.classList.remove("usando-teclado");
    });

    const elementosFocaveis = document.querySelectorAll('input, button, select, textarea, a, [tabindex]:not([tabindex="-1"])');
    elementosFocaveis.forEach((elemento, index) => {
        elemento.addEventListener("focus", function () {
            if (document.body.classList.contains("usando-teclado")) {
                anunciarStatus(`Elemento ${index + 1} de ${elementosFocaveis.length} focado: ${this.getAttribute("aria-label") || this.textContent?.slice(0, 50) || this.tagName}`);
            }
        });
    });
}

function configurarAtalhosTeclado() {
    document.addEventListener("keydown", function (e) {
        if (e.altKey && e.key === "1") {
            e.preventDefault();
            const primeiroTamanho = document.getElementById("tamanho-50ml");
            if (primeiroTamanho) {
                primeiroTamanho.click();
                focarElemento(primeiroTamanho);
                anunciar("Tamanho 50ml selecionado via atalho Alt+1");
            }
        }

        if (e.altKey && e.key === "2") {
            e.preventDefault();
            const segundoTamanho = document.getElementById("tamanho-75ml");
            if (segundoTamanho) {
                segundoTamanho.click();
                focarElemento(segundoTamanho);
                anunciar("Tamanho 75ml selecionado via atalho Alt+2");
            }
        }

        if (e.altKey && e.key === "3") {
            e.preventDefault();
            const terceiroTamanho = document.getElementById("tamanho-100ml");
            if (terceiroTamanho) {
                terceiroTamanho.click();
                focarElemento(terceiroTamanho);
                anunciar("Tamanho 100ml selecionado via atalho Alt+3");
            }
        }

        if (e.ctrlKey && e.key === "Enter") {
            e.preventDefault();
            const botaoFinalizar = document.getElementById("finalizar-pedido");
            if (botaoFinalizar && !botaoFinalizar.disabled) {
                finalizarPedido();
                anunciar("Pedido finalizado via atalho Ctrl+Enter");
            }
        }
    });
}

function verificarContrasteCompliance() {
    const elementosTexto = document.querySelectorAll("p, span, div, a, button, label, h1, h2, h3, h4, h5, h6");

    elementosTexto.forEach((elemento) => {
        const estilos = getComputedStyle(elemento);
        const corTexto = estilos.color;
        const corFundo = estilos.backgroundColor;

        if (corTexto && corFundo && corFundo !== "rgba(0, 0, 0, 0)") {
            const contraste = calcularContraste(corTexto, corFundo);
            if (contraste < 4.5) {
                console.warn(`Contraste insuficiente detectado: ${contraste.toFixed(2)}:1`, elemento);
            }
        }
    });
}

function calcularContraste(cor1, cor2) {
    const rgb1 = extrairRGB(cor1);
    const rgb2 = extrairRGB(cor2);

    const luminancia1 = calcularLuminancia(rgb1);
    const luminancia2 = calcularLuminancia(rgb2);

    const luminanciaClara = Math.max(luminancia1, luminancia2);
    const luminanciaEscura = Math.min(luminancia1, luminancia2);

    return (luminanciaClara + 0.05) / (luminanciaEscura + 0.05);
}

function extrairRGB(cor) {
    const match = cor.match(/\d+/g);
    return match ? match.map(Number) : [0, 0, 0];
}

function calcularLuminancia([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function inicializar() {
    console.log("🚀 Iniciando SIFURRAH Acessível + Visual...");

    aplicarModoCegueira();

    const radiosTamanho = document.querySelectorAll('input[name="tamanho"]');
    radiosTamanho.forEach((radio) => {
        radio.addEventListener("change", aoMudarTamanho);
    });

    const selectQuantidade = document.getElementById("quantidade");
    selectQuantidade.addEventListener("change", aoMudarQuantidade);

    const radiosPagamento = document.querySelectorAll('input[name="pagamento"]');
    radiosPagamento.forEach((radio) => {
        radio.addEventListener("change", aoMudarPagamento);
    });

    const camposObrigatorios = document.querySelectorAll("input[required]");
    camposObrigatorios.forEach((campo) => {
        campo.addEventListener("blur", () => validarCampo(campo));
        campo.addEventListener("input", () => {
            if (campo.classList.contains("erro")) {
                validarCampo(campo);
            }
        });
    });

    const campoCep = document.getElementById("cep");
    if (campoCep) {
        campoCep.addEventListener("input", () => aplicarMascaraCep(campoCep));
    }

    const campoTelefone = document.getElementById("telefone");
    if (campoTelefone) {
        campoTelefone.addEventListener("input", () => aplicarMascaraTelefone(campoTelefone));
    }

    adicionarEfeitosVisuais();
    configurarFallbackImagens();
    configurarNavegacaoTeclado();
    configurarAtalhosTeclado();

    calcularPrecos();
    atualizarProgresso(1);

    setTimeout(() => {
        anunciar(
            "Página da SIFURRAH carregada com sucesso. Perfume Essence de Suvacu, o perfume dos sonhos, está disponível com oferta especial de 10% de desconto à vista no PIX. Use Tab para navegar, Alt+1, Alt+2, Alt+3 para selecionar tamanhos rapidamente, e Ctrl+Enter para finalizar o pedido."
        );

        if (!MODO_CEGUEIRA) {
            verificarContrasteCompliance();
        }
    }, 1000);

    const detailsElementos = document.querySelectorAll("details");
    detailsElementos.forEach((details) => {
        details.addEventListener("toggle", function () {
            if (this.open) {
                const summary = this.querySelector("summary");
                anunciar(`Seção expandida: ${summary?.textContent || "Informações adicionais"}`);
            }
        });
    });

    console.log("✅ SIFURRAH Acessível + Visual inicializada com sucesso");
}

document.addEventListener("DOMContentLoaded", inicializar);

window.finalizarPedido = finalizarPedido;
window.novaCompra = novaCompra;
