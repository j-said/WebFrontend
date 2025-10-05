export class Product {
    constructor(title, description, price, type, imageUrl = null) {
        this.id = Date.now().toString() + Math.random().toString(36);
        this.title = title;
        this.description = description;
        this.price = parseFloat(price);
        this.type = type;
        this.imageUrl = imageUrl || this.getDefaultImage();
        this.createdAt = new Date();
        this.lastUpdated = new Date();
    }

    getDefaultImage() {
        const images = {
            camera: '/img/cam.png',
            laptop: '/img/laptop.png',
            smartphone: '/img/smartphone.png'
        };
        const typeKey = (this.type || '').toLowerCase().trim();
        const imgPath = images[typeKey] || '/img/default.png';

        return imgPath;
    }

    updateTimestamp() {
        this.lastUpdated = new Date();
    }

    toHTML() {
        const timeDiff = Math.floor((new Date() - this.lastUpdated) / (1000 * 60 * 60));
        let timeText = '';

        if (timeDiff < 1) timeText = 'Just now';
        else if (timeDiff < 24) timeText = `${timeDiff} hour${timeDiff > 1 ? 's' : ''} ago`;
        else timeText = `${Math.floor(timeDiff / 24)} day${Math.floor(timeDiff / 24) > 1 ? 's' : ''} ago`;

        return `
            <div class="product-card" data-id="${this.id}" data-price="${this.price}">
                <div class="product-image">
                    <img src="${this.imageUrl}" alt="${this.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="product-info">
                    <h3>${this.title}</h3>
                    <p>${this.description}</p>
                    <div class="product-price">$${this.price.toFixed(2)}</div>
                    <div class="product-meta">
                        <span>Last updated: ${timeText}</span>
                    </div>
                    <div class="product-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="remove-btn">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }
}