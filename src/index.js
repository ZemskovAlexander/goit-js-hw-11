import './css/styles.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

axios.defaults.baseURL = 'https://pixabay.com/api';

const KEY = '29525143-9c76bb8aba39698f94cc40e50';

const findedImages = document.querySelector('.gallery');

const searchField = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more');
const resultsOnPage = 40;

let searchData;
let currentPage = 1;
let showedImagesAmount = 0;
let findedImageQuantity = 0;

findedImages.addEventListener('click', onViewLargeImg);

let gallery = new SimpleLightbox('.gallery a', {
  captionType: 'attr',
  captionsData: 'alt',
  captionDelay: 250,
});

searchField.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMoreImages);

function onSearch(e) {
  e.preventDefault();

  if (searchData === e.target.elements.searchQuery.value) return;

  searchData = e.target.elements.searchQuery.value;
  clearGallery();

  fetchData(searchData);
}

async function onLoadMoreImages() {
  currentPage += 1;

  if (currentPage === 2) {
    activateInfScroll();
  }

  await fetchData();

  scrollingDown();
  hideLoadMoreBtn();
}

async function fetchData() {
  try {
    const { data } = await axios.get(
      `?key=${KEY}&q=${searchData}&per_page=${resultsOnPage}&page=${currentPage}&image_type=photo&orientation=horizontal&safesearch=true`
    );

    findedImageQuantity = data.totalHits;
    showedImagesAmount += data.hits.length;

    if (findedImageQuantity === 0) {
      clearGallery();

      Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }

    if (showedImagesAmount <= resultsOnPage) {
      Notify.success(`Hooray! We found ${findedImageQuantity} images.`);
    }

    if (findedImageQuantity > resultsOnPage) {
      showLoadMoreBtn();
    }

    renderList(data.hits);
  } catch (error) {
    console.log(error.message);
  }
}

async function renderList(items) {
  const list = await items
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a href="${largeImageURL}"><div class="photo-card">
      <img src="${webformatURL} " alt="${tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b></br>${likes}
        </p>
        <p class="info-item">
          <b>Views</b></br>${views}
        </p>
        <p class="info-item">
          <b>Comments</b></br>${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b></br>${downloads}
        </p>
      </div>
    </div></a>`
    )
    .join('');

  findedImages.insertAdjacentHTML('beforeend', list);

  gallery.refresh();
}

function clearGallery() {
  hideLoadMoreBtn();
  currentPage = 1;
  findedImages.innerHTML = '';
  showedImagesAmount = 0;
  deactiveInfScroll();
}

function showLoadMoreBtn() {
  loadMoreBtn.classList.add('show');
}

function hideLoadMoreBtn() {
  loadMoreBtn.classList.remove('show');
}

function onViewLargeImg(e) {
  e.preventDefault();
}

function scrollingDown() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function activateInfScroll() {
  window.addEventListener('scroll', nextPageInfScroll);
}

function deactiveInfScroll() {
  window.removeEventListener('scroll', nextPageInfScroll);
}

function nextPageInfScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight) {
    onLoadMoreImages();
    scrollingDown();
    if (showedImagesAmount >= findedImageQuantity) {
      deactiveInfScroll();
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }
}
