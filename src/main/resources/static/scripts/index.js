/**
 * Classe que lida com a interface gráfica.
 *
 * - pode (e deve) manipular diretamente o dom usando bibliotecas como JQuery, underscore, etc.
 * - não deve conhecer nenhum detalhe da comunicação com o servidor 'The Movie Database'.
 */
class UI {
    /** @namespace filme.genre_ids */
    /** @namespace filme.poster_path */
    /** @namespace filme.release_date */
    /** @namespace filme.overview */
    /** @namespace filme.original_title */

    constructor() {
        this.server = new Server();
        this.generos = new Map();
        this.templateHtmlFilme = Handlebars.compile($("#template-filme").html());
        this.barraBusca$ = $(".barra-busca");
        this.campoBusca$ = $(".campo-busca");
        this.botaoPesquisar$ = $(".botao-pesquisar");
    }

    setup() {
        $.when(this.server.carregaGeneros(this.onGenerosCarregados.bind(this))).done(()=>{
            /* mostra a barra somente depois de conseguir carregar os gêneros. */
            this.barraBusca$.show();
            this.campoBusca$.focus();
        });

        this.campoBusca$.keyup((event) => {
            if(event.keyCode == 13){
                this.botaoPesquisar$.click();
            }
        });

        this.botaoPesquisar$.click(() => {
            this.server.pesquisaFilme(this.campoBusca$.val(), this.onPesquisaRealizada.bind(this))
        });
    }

    onPesquisaRealizada(filmes) {
        UI.limpaResultado();

        let filmesHtml = filmes.map((filme) => {
            //noinspection JSValidateTypes
            return this.templateHtmlFilme({
                titulo: filme.title,
                titulo_original: filme.original_title,
                sinopse: filme.overview,
                ano_lancamento: (filme.release_date != "") ? `(${moment(filme.release_date).year()})` : "",
                path_cartaz: (filme.poster_path != null) ? `http://image.tmdb.org/t/p/w154${filme.poster_path}` : "/imagens/no-poster.png",
                generos: _.map(filme.genre_ids, (genre_id) => {
                    return this.generos.get(genre_id);
                })
            });
        });

        UI.carregaResultado(filmesHtml);
    }

    onGenerosCarregados(generos) {
        for(let genero of generos) {
            this.generos.set(genero.id, genero.name);
        }
    }

    static limpaResultado() {
        $(".filmes tbody").empty();
    }

    static carregaResultado(filmesHtml) {
        $(".filmes tbody").append(filmesHtml);
    }

}

/**
 * Classe que lida com os detalhes da comunicação com o servidor 'The Movie Database'.
 */
class Server {
    /** @namespace result.genres */
    /** @namespace result.total_pages */
    /** @namespace result.total_results */
    /** @namespace result.results */

    pesquisaFilme(query, onDone) {
        return $.ajax({
            method: "GET",
            url: `https://api.themoviedb.org/3/search/movie`,
            data: {
                api_key: `a500a4291e09f6a2ba7c43214281c000`,
                language: `pt-BR`,
                query: query,
            }
        }).done((result) => {
            onDone(result.results, result.page, result.total_results, result.total_pages)
        });
    }

    carregaGeneros(onDone) {
        return $.ajax({
            method: "GET",
            url: `https://api.themoviedb.org/3/genre/movie/list`,
            data: {
                api_key: `a500a4291e09f6a2ba7c43214281c000`,
                language: `pt-BR`
            }
        }).done((result) => {
            onDone(result.genres)
        });
    }

}