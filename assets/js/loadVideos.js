    document.addEventListener("DOMContentLoaded", () => {
        // Cargar el archivo JSON
        fetch('./assets/json/videosList.json') // Reemplaza con la ruta correcta de tu archivo JSON
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('video-container');
                const movieList = document.getElementById('movieList');
                const filterMenu = document.getElementById('filterMenu');
                const filterOptions = document.querySelectorAll('.filter-option');
                const videoPlayerLocal = document.getElementById('video-player-local'); // Para videos locales
                const videoPlayerYouTube = document.getElementById('video-player-youtube'); // Para videos de YouTube
                const videoTitle = document.getElementById('video-title');
                const back = document.getElementById('bt-back');
                const descript = document.getElementById('video-description');
                const shareButton = document.getElementById('share-button'); // Botón para compartir el enlace directo
                const downloadButton = document.getElementById('download-button'); // Botón de descarga
                const cast = document.getElementById('Video-Elenco');

                let currentIndex = 0; // Índice actual de imágenes mostradas
                const batchSize = 20; // Cantidad de imágenes por lote

                // Función para cargar un lote de imágenes
                const loadImages = (category = 'all') => {
                    let filteredData;

                    // Si la categoría es 'all', no se filtra nada, pero limitamos la carga a batchSize
                    if (category === 'all') {
                        filteredData = data.slice(currentIndex, currentIndex + batchSize); // Limitar solo a batchSize al mostrar todo
                    } else {
                        // Filtrar por categoría seleccionada
                        filteredData = data.filter(item => {
                            const categories = item.category.split(',').map(c => c.trim());
                            return categories.includes(category);
                        });
                    }

                    // Cargar los elementos filtrados
                    filteredData.forEach(item => {
                        const videoElement = document.createElement('div');
                        videoElement.innerHTML = `
                            <div class="contedr">
                                <img class="thumbnail" src="${item.imagen}" alt="${item.titulo}" style="cursor:pointer;" />

                            </div>
                        `;
                        videoElement.querySelector('img').addEventListener('click', () => playVideo(item));
                        container.appendChild(videoElement);
                    });

                    // Si se seleccionó "all", actualizamos el índice para las próximas cargas
                    if (category === 'all') {
                        currentIndex += batchSize;

                        // Ocultar el botón "Ver más" si se han cargado todas las imágenes de la categoría "all"
                        if (currentIndex >= data.length) {
                            document.getElementById('load-more').style.display = 'none';
                        } else {
                            document.getElementById('load-more').style.display = 'block';
                        }
                    } else {
                        // Si la categoría no es "all", no mostramos el botón "Ver más"
                        document.getElementById('load-more').style.display = 'none';
                    }
                };

                // Cargar el primer lote de imágenes (o los videos) al principio
                loadImages();

                // Función para reproducir el video según el objeto de datos
                const playVideo = (item) => {
                    let videoUrl;

                    if (item.vi) {
                        // Video local
                        videoPlayerLocal.src = item.video;
                        videoPlayerLocal.style.display = 'block';
                        document.getElementById('trailer').style.display = 'block';
                        document.getElementById('menu').style.display = 'none';
                        document.getElementById('load-more').style.display = 'none';
                        videoPlayerYouTube.style.display = 'none';
                        videoPlayerLocal.play();
                        videoUrl = window.location.origin + item.video;

                        downloadButton.style.display = 'inline-none';
                        downloadButton.href = item.video;
                        downloadButton.download = item.titulo + ".mp4";
                    } else {
                        let youtubeEmbedUrl = item.video;

                        if (youtubeEmbedUrl.includes('youtu.be')) {
                            const videoId = youtubeEmbedUrl.split('/').pop();
                            youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
                            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                        } else if (youtubeEmbedUrl.includes('watch?v=')) {
                            youtubeEmbedUrl = youtubeEmbedUrl.replace('watch?v=', 'embed/');
                            videoUrl = item.video;
                        }

                        videoPlayerYouTube.src = youtubeEmbedUrl;
                        videoPlayerYouTube.style.display = 'block';
                        videoPlayerLocal.style.display = 'none';

                        downloadButton.style.display = 'none';
                    }

                    videoTitle.textContent = item.titulo;
                    descript.textContent = item.descript;
                    videoTitle.style.display = 'block';
                    descript.style.display = 'block';
                    container.style.display = 'none';
                    back.style.display = 'block';
                    shareButton.style.display = 'block';
                    cast.textContent = item.cast;
                    cast.style.display = '  ';
                    // Actualizar la imagen dentro del ID "poster"
                    const posterElement = document.getElementById("poster");
                    if (posterElement) {
                        posterElement.innerHTML = `
                            <img class="thumbnail" src="${item.imagen}" alt="${item.titulo}" style="cursor:pointer; width: 100%; height: auto;" />
                        `;
                    }

                    shareButton.onclick = () => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('video', item.titulo);

                        if (navigator.share) {
                            navigator.share({
                                title: item.titulo,
                                url: url.toString()
                            })
                            .then(() => console.log('Video shared successfully'))
                            .catch(error => console.error('Error sharing video:', error));
                        } else {
                            navigator.clipboard.writeText(url.toString()).then(() => {
                                alert('Enlace copiado al portapapeles');
                            });
                        }
                    };
                };

                // Reproducir el video si se especifica en la URL
                const urlParams = new URLSearchParams(window.location.search);
                const videoParam = urlParams.get('video');

                if (videoParam) {
                    const videoToPlay = data.find(item => item.titulo === decodeURIComponent(videoParam));
                    if (videoToPlay) {
                        playVideo(videoToPlay);
                    } else {
                        console.error('No se encontró el video especificado en el parámetro URL.');
                    }
                }

                // Mostrar todas las películas al principio
                const showMovies = (category) => {
                    currentIndex = 0; // Reiniciar el índice para cargar desde el principio
                    container.innerHTML = ''; // Limpiar el contenedor de videos
                    loadImages(category); // Cargar imágenes filtradas por categoría
                };

                // Evento para mostrar el menú de filtro
                document.getElementById('menu').addEventListener('click', () => {
                    const modal = document.querySelector('.memodal'); // Selecciona el contenedor modal
                    modal.classList.toggle('show'); // Agrega o quita la clase para mostrar u ocultar
                });

                // Evento para ocultar el menú al hacer clic en una opción
                document.querySelectorAll('.filter-option').forEach(option => {
                    option.addEventListener('click', (event) => {
                        event.preventDefault(); // Evita el comportamiento por defecto del enlace

                        const modal = document.querySelector('.memodal'); // Selecciona el contenedor modal
                        modal.classList.remove('show'); // Oculta el modal

                        const category = option.getAttribute('data-category');
                        showMovies(category); // Filtrar por categoría
                    });
                });

                // Añadir el evento al botón "Ver más"
                document.getElementById('load-more').addEventListener('click', () => loadImages('all'));
            })
            .catch(error => console.error('Error al cargar el JSON:', error));
    });
    document.addEventListener("DOMContentLoaded", () => {
        // Detectar si el dispositivo es un televisor
        const userAgent = navigator.userAgent.toLowerCase();
        const isTV = userAgent.includes("smart-tv") || userAgent.includes("tv") || userAgent.includes("webos") || userAgent.includes("tizen");

        // Agregar clase al body según el dispositivo
        if (isTV) {
            document.body.classList.add("tv-mode");
        } else {
            document.body.classList.add("computer-mode");
        }
    });
    document.addEventListener("DOMContentLoaded", () => {
        const button = document.querySelector("body.computer-mode button");

        const adjustButtonPosition = () => {
            const container = document.querySelector(".contenedor");
            if (container && button) {
                const containerHeight = container.offsetHeight;
                button.style.top = `${containerHeight}px`; // Ajustar posición relativa al contenedor
            }
        };

        // Llama a la función al cargar contenido dinámico
        adjustButtonPosition();

        // Recalcula cuando se genera nuevo contenido
        document.querySelector("#load-more").addEventListener("click", () => {
            setTimeout(adjustButtonPosition, 1); // Ajustar después de cargar más contenido
        });
    });
    document.addEventListener("DOMContentLoaded", () => {
        // Detectar si el dispositivo es móvil o tableta
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|windows phone/.test(userAgent);

        // Agregar clase al body según el dispositivo
        if (isMobile) {
            document.body.classList.add("mobile");
        } else {
            document.body.classList.add("desktop");
        }
    });