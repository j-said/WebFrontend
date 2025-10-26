export class Product {
    constructor(title, description, price, type, imageUrl = null) {
        // ID and createdAt will be set by the DB,
        // but we set them when we load the data
        this.id = null;
        this.createdAt = null;
        this.title = title;
        this.description = description;
        this.price = parseFloat(price);
        this.type = type;
        this.imageUrl = imageUrl || this.getDefaultImage();
    }

    getDefaultImage() {
        const images = {
            camera: '/static/img/cam.png',
            laptop: '/static/img/laptop.png',
            smartphone: '/static/img/smartphone.png'
        };
        const typeKey = (typeof this.type === 'string' ? this.type : '').toLowerCase().trim();
        return images[typeKey] || '/static/img/default.png';
    }

    toHTML() {
        return `
        <div class="product-card" data-id="${this.id}" data-price="${this.price}">
            <div class="product-image">
                <img src="${this.imageUrl}" alt="${this.title}">
            </div>
            <div class="product-info">
                <h3>${this.title}</h3>
                <p>${this.description}</p>
                <div class="product-price">$${this.price.toFixed(2)}</div>
                <div class="product-meta">
                    <span>Type: ${this.type}</span>
                </div>
                <div class="product-actions">
                    <button class="edit-btn" data-id="${this.id}">Edit</button>
                    <button class="remove-btn" data-id="${this.id}">Remove</button>
                </div>
            </div>
        </div>
    `;
    }
}