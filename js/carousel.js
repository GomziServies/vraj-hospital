const galleryContainer=document.querySelector(".gallery-container"),galleryControlsContainer=document.querySelector(".gallery-controls"),galleryControls=["previous","next"],galleryItems=document.querySelectorAll(".gallery-item");class Carousel{constructor(e,r,l){this.carouselContainer=e,this.carouselControls=l,this.carouselArray=[...r]}updateGallery(){this.carouselArray.forEach(e=>{e.classList.remove("gallery-item-1"),e.classList.remove("gallery-item-2"),e.classList.remove("gallery-item-3"),e.classList.remove("gallery-item-4"),e.classList.remove("gallery-item-5")}),this.carouselArray.slice(0,5).forEach((e,r)=>{e.classList.add(`gallery-item-${r+1}`)})}setCurrentState(e){"gallery-controls-previous"==e.className?this.carouselArray.unshift(this.carouselArray.pop()):this.carouselArray.push(this.carouselArray.shift()),this.updateGallery()}setControls(){this.carouselControls.forEach(e=>{galleryControlsContainer.appendChild(document.createElement("button")).className=`gallery-controls-${e}`,document.querySelector(`.gallery-controls-${e}`).innerText=e})}useControls(){[...galleryControlsContainer.childNodes].forEach(e=>{e.addEventListener("click",r=>{if(r.preventDefault(),"gallery-controls-add"==e.className){const e=document.createElement("img"),r=this.carouselArray.length,l=this.carouselArray.findIndex(e=>e.getAttribute("data-index")==this.carouselArray.length)+1;Object.assign(e,{className:"gallery-item",src:`http://fakeimg.pl/300/?text=${this.carouselArray.length+1}`}),e.setAttribute("data-index",this.carouselArray.length+1),this.carouselArray.splice(l,0,e),document.querySelector(`[data-index="${r}"]`).after(e),this.updateGallery()}else this.setCurrentState(e)})})}}const exampleCarousel=new Carousel(galleryContainer,galleryItems,galleryControls);exampleCarousel.setControls(),exampleCarousel.useControls();