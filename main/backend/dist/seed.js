"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemo = seedDemo;
const prisma_1 = require("./lib/prisma");
async function seedDemo() {
    const total = await prisma_1.prisma.product.count();
    if (total > 0)
        return;
    const categories = [
        { name: 'FOOTWEAR', slug: 'footwear' },
        { name: 'LEGWEAR', slug: 'legwear' },
        { name: 'TORSO', slug: 'torso' },
        { name: 'HEADWEAR', slug: 'headwear' },
        { name: 'ACCESSORIES', slug: 'accessories' }
    ];
    const createdCats = [];
    for (const cat of categories) {
        const created = await prisma_1.prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat
        });
        createdCats.push(created);
    }
    const brandPrefixes = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Reebok', 'Jordan', 'Converse'];
    const footwearTypes = ['Running Shoes', 'Basketball Sneakers', 'Training Sneakers', 'Hiking Boots', 'Casual Sneakers', 'Tennis Shoes'];
    const legwearTypes = ['Jogging Pants', 'Training Shorts', 'Yoga Leggings', 'Basketball Shorts', 'Running Shorts', 'Gym Leggings'];
    const torsoTypes = ['Training Shirts', 'Polo Shirts', 'Hoodies', 'Windbreakers', 'Tank Tops', 'Long Sleeve Shirts'];
    const headwearTypes = ['Baseball Caps', 'Beanies', 'Sun Hats', 'Bike Helmets', 'Snapback Caps', 'Bucket Hats'];
    const accessoryTypes = ['Gym Bags', 'Sports Watches', 'Training Gloves', 'Duffel Bags', 'Smart Watches', 'Waist Packs'];
    const adjectives = ['Pro', 'Elite', 'Max', 'Ultra', 'Prime', 'Core', 'Essential', 'Performance'];
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Navy', 'Orange'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const basePrices = [29.99, 49.99, 79.99, 99.99, 129.99, 159.99, 199.99];
    for (let i = 0; i < 50; i++) {
        const brand = brandPrefixes[Math.floor(Math.random() * brandPrefixes.length)];
        const category = createdCats[Math.floor(Math.random() * createdCats.length)];
        if (!category || !brand)
            continue;
        let type = '';
        if (category.name === 'FOOTWEAR') {
            const selectedType = footwearTypes[Math.floor(Math.random() * footwearTypes.length)];
            if (selectedType)
                type = selectedType;
        }
        else if (category.name === 'LEGWEAR') {
            const selectedType = legwearTypes[Math.floor(Math.random() * legwearTypes.length)];
            if (selectedType)
                type = selectedType;
        }
        else if (category.name === 'TORSO') {
            const selectedType = torsoTypes[Math.floor(Math.random() * torsoTypes.length)];
            if (selectedType)
                type = selectedType;
        }
        else if (category.name === 'HEADWEAR') {
            const selectedType = headwearTypes[Math.floor(Math.random() * headwearTypes.length)];
            if (selectedType)
                type = selectedType;
        }
        else if (category.name === 'ACCESSORIES') {
            const selectedType = accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)];
            if (selectedType)
                type = selectedType;
        }
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        if (!type || !adj || !color)
            continue;
        const name = `${brand} ${type} ${adj} ${color}`;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const basePrice = basePrices[Math.floor(Math.random() * basePrices.length)];
        const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0;
        const finalPrice = (basePrice || 0) * (1 - discount / 100);
        if (!basePrice)
            continue;
        const isNew = i % 3 === 0;
        const isSuperSale = i % 5 === 0;
        const isPremium = i % 7 === 0;
        let tagName = '';
        if (isNew)
            tagName = 'НОВИНКА';
        else if (isSuperSale)
            tagName = 'СУПЕР СКИДКА';
        else if (isPremium)
            tagName = 'ПРЕМИУМ';
        const product = await prisma_1.prisma.product.create({
            data: {
                name,
                slug,
                description: `High-quality ${type.toLowerCase()} with premium materials and advanced technology. Perfect for ${category.name.toLowerCase()} activities.`,
                price: finalPrice,
                originalPrice: discount > 0 ? (basePrice || 0) : null,
                stock: Math.floor(Math.random() * 50) + 5,
                categoryId: category.id,
                tag: tagName || null,
                images: {
                    create: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => ({
                        url: `/img/products/${slug}-${idx + 1}.jpg`
                    }))
                },
                variants: {
                    create: sizes.map(size => ({
                        name: size,
                        value: size,
                        stock: Math.floor(Math.random() * 20) + 1
                    }))
                }
            }
        });
    }
}
//# sourceMappingURL=seed.js.map