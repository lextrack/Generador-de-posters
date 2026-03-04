const state = {
    currentImage: null,
    currentJob: null,
    canvasCells: []
};

export function getCurrentImage() {
    return state.currentImage;
}

export function setCurrentImage(image) {
    state.currentImage = image;
}

export function getCurrentJob() {
    return state.currentJob;
}

export function setCurrentJob(job) {
    state.currentJob = job;
}

export function getCanvasCells() {
    return state.canvasCells;
}

export function setCanvasCells(cells) {
    state.canvasCells = cells;
}
