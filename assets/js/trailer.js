document.addEventListener("DOMContentLoaded", () => {
    // Crear modal para mostrar el trailer
    const modal = document.createElement('div');
    modal.id = 'trailer-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 100;
        justify-content: center;
        align-items: center;
    `;
    modal.innerHTML = `
        <div style="position: relative; width: 80%; max-width: 800px; background: #000; border-radius: 10px;">
            <iframe id="trailer-video" width="100%" height="400px" frameborder="0" allowfullscreen></iframe>
            <button id="close-modal" style="
                position: absolute;
                top: 415px;
                right: 10px;
                linear-gradient(to right, rgb(1, 4, 50), rgb(40, 0, 77));
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
            ">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);

    const trailerButton = document.getElementById('trailer');
    const trailerModal = document.getElementById('trailer-modal');
    const trailerVideo = document.getElementById('trailer-video');
    const closeModalButton = document.getElementById('close-modal');
    const videoPlayerLocal = document.getElementById('video-player-local'); // Video local
    const videoPlayerYouTube = document.getElementById('video-player-youtube'); // Video YouTube (iframe)
    let isLocalVideoPlaying = false;

    let videosData = []; // Variable para almacenar los datos del JSON

    // Cargar el archivo JSON
    fetch('./assets/json/videosList.json')
        .then(response => response.json())
        .then(data => {
            videosData = data; // Guardar los datos en la variable
        })
        .catch(error => console.error('Error al cargar el JSON:', error));

    trailerButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto

        // Pausar el video que esté reproduciéndose
        if (!videoPlayerLocal.paused) {
            videoPlayerLocal.pause();
            isLocalVideoPlaying = true;
        } else if (videoPlayerYouTube.style.display === 'block') {
            videoPlayerYouTube.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }

        const currentVideoData = videosData.find(item => item.trailer && item.titulo === document.getElementById('video-title').textContent);

        if (currentVideoData && currentVideoData.trailer) {
            trailerVideo.src = formatYouTubeUrl(currentVideoData.trailer); // Cargar el trailer del JSON
            trailerModal.style.display = 'flex'; // Mostrar el modal
        } else {
            alert('Trailer no disponible para este video.');
        }
    });

    closeModalButton.addEventListener('click', () => {
        trailerVideo.src = ''; // Detener el trailer
        trailerModal.style.display = 'none'; // Ocultar el modal

        // Reproducir el video pausado
        if (isLocalVideoPlaying) {
            videoPlayerLocal.play();
            isLocalVideoPlaying = false;
        } else if (videoPlayerYouTube.style.display === 'block') {
            videoPlayerYouTube.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
    });

    // Ocultar el modal si se hace clic fuera del contenido
    trailerModal.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            trailerVideo.src = ''; // Detener el trailer
            trailerModal.style.display = 'none'; // Ocultar el modal

            // Reproducir el video pausado
            if (isLocalVideoPlaying) {
                videoPlayerLocal.play();
                isLocalVideoPlaying = false;
            } else if (videoPlayerYouTube.style.display === 'block') {
                videoPlayerYouTube.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
        }
    });

    const formatYouTubeUrl = (url) => {
        if (url.includes('watch?v=')) {
            return url.replace('watch?v=', 'embed/').split('&')[0];
        } else if (url.includes('youtu.be')) {
            const videoId = url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // Devuelve la URL original si no coincide
    };
});

document.addEventListener("keydown", (event) => {
    const videoPlayerLocal = document.getElementById("video-player-local"); // Video local
    const videoPlayerYouTube = document.getElementById("video-player-youtube"); // Video YouTube
    const videoElement = videoPlayerLocal.style.display !== "none" ? videoPlayerLocal : videoPlayerYouTube;

    // Detectar la tecla presionada
    if (event.code === "KeyF") {
        // Alternar entre pantalla completa y salir de pantalla completa
        if (!document.fullscreenElement) {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen(); // Entrar en pantalla completa
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen(); // Safari
            } else if (videoElement.msRequestFullscreen) {
                videoElement.msRequestFullscreen(); // IE/Edge
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen(); // Salir de pantalla completa
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen(); // Safari
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen(); // IE/Edge
            }
        }
    }

    // Salir de pantalla completa al presionar Esc
    if (event.code === "Escape" && document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen(); // Salir de pantalla completa
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen(); // Safari
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen(); // IE/Edge
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const container = document.getElementById("video-container");

    let moviesData = []; // Almacenará los datos del JSON

    // Cargar el archivo JSON
    fetch('./assets/json/videosList.json')
        .then(response => response.json())
        .then(data => {
            moviesData = data; // Guardamos los datos para usarlos en la búsqueda
        })
        .catch(error => console.error("Error al cargar el JSON:", error));

    // Función para buscar películas
    const searchMovies = (query) => {
        searchResults.innerHTML = ""; // Limpiar resultados anteriores
        const filteredMovies = moviesData.filter(movie =>
            movie.titulo.toLowerCase().includes(query.toLowerCase()) ||
            movie.cast.toLowerCase().includes(query.toLowerCase())
        );

        filteredMovies.forEach(movie => {
            const movieElement = document.createElement("div");
            movieElement.className = "movie-item";
            movieElement.innerHTML = `
                <img class="thumbnail" src="${movie.imagen}" alt="${movie.titulo}" style="cursor:pointer;">
                <div class="movie-title">${movie.titulo}</div>
            `;

            // Agregar evento al contenedor completo
            movieElement.addEventListener("click", () => playMovie(movie));

            searchResults.appendChild(movieElement);
        });

        if (filteredMovies.length === 0) {
            searchResults.innerHTML = "<p style='color:white;'>No se encontraron películas.</p>";
        }
    };

    // Reproducir película al hacer clic en la imagen o el contenedor
    const playMovie = (movie) => {
        const videoPlayerLocal = document.getElementById("video-player-local");
        const videoPlayerYouTube = document.getElementById("video-player-youtube");
        const videoTitle = document.getElementById("video-title");
        const descript = document.getElementById("video-description");
        const cast = document.getElementById("Video-Elenco");
        const downloadButton = document.getElementById("download-button");
        const menu = document.getElementById("menu");
        const loadMoreButton = document.getElementById("load-more");
        const backButton = document.getElementById("bt-back");
        const shareButton = document.getElementById("share-button"); // Nuevo elemento
        const trailer = document.getElementById("trailer"); // Nuevo elemento

        // Configurar los datos del video
        videoTitle.textContent = movie.titulo;
        descript.textContent = movie.descript;
        cast.textContent = movie.cast;

        if (movie.vi) {
            videoPlayerLocal.src = movie.video;
            videoPlayerLocal.style.display = "block";
            videoPlayerLocal.play();
            videoPlayerYouTube.style.display = "none";

            downloadButton.style.display = "inline-block";
            downloadButton.href = movie.video;
            downloadButton.download = `${movie.titulo}.mp4`;
        } else {
            videoPlayerYouTube.src = movie.trailer;
            videoPlayerYouTube.style.display = "block";
            videoPlayerLocal.style.display = "none";
            downloadButton.style.display = "none";
        }

        container.style.display = "none";
        searchResults.innerHTML = ""; // Limpiar resultados después de seleccionar

        // Ocultar el menú y el botón "Ver más"
        if (menu) menu.style.display = "none";
        if (loadMoreButton) loadMoreButton.style.display = "none";

        // Mostrar el botón "Atrás", el botón "Compartir" y el "trailer"
        if (backButton) backButton.style.display = "block";
        if (shareButton) shareButton.style.display = "block";
        if (trailer) trailer.style.display = "block";
    };

    // Evento para buscar al escribir
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
            searchResults.style.display = "block"; // Mostrar resultados
        } else {
            searchResults.style.display = "none"; // Ocultar resultados si el input está vacío
        }
    });

    // Ocultar resultados al hacer clic fuera del input o resultados
    document.addEventListener("click", (event) => {
        if (
            !searchInput.contains(event.target) && // Si el clic no es en el input
            !searchResults.contains(event.target) // Si el clic no es en los resultados
        ) {
            searchResults.style.display = "none"; // Ocultar resultados
        }
    });

    // Mostrar resultados nuevamente al enfocar el input
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) {
            searchResults.style.display = "block";
        }
    });
});
