var eventBus = new Vue();


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `<div>
<div class="product-image">
        <img v-bind:src="image" width="100 px"/>
    </div>

    <div class="product-info">
        <h1>{{ title }}</h1>
        <h3 v-if="onSale">{{ print }}</h3>

        <p v-if="inStock">In Stock</p>
        <p v-else-if="inventory<=10 && inventory>0">Almost sold out</p>
        <p v-else :class="{'lineThrough': !inStock}">Out of Stock</p>
        <p>User is premium: {{ shipping }}</p>

        <p v-show="inventory>0">Remaining: {{ inventory }}</p>

        <product-details :details = "details"></product-details>

        <div v-for="(variant, index) in variants"
             v-bind:key="variant.variantId"
             class="color-box"
             :style="{ backgroundColor: variant.variantColor }"
             @mouseover="updateProduct(index)">
        </div>
       

        <button v-on:click="addToCart"
                :disabled="!inStock"
                :class="{ disabledButton: !inStock}"
        >Add to Cart
        </button>
        
        <button v-on:click="removeFromCart"
                :disabled="!inStock"
                :class="{ disabledButton: !inStock}"
        >Remove from Cart
        </button>
    </div>
    
    <products-tabs :reviews="reviews"></products-tabs>   
    
    </div>`,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            inventory: 0,
            onSale: true,
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: 'assets/vmSocks-blue.jpg',
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: 'assets/vmSocks-green.jpg',
                    variantQuantity: 0
                }
            ],
            reviews: [],
            details: ["80% cotton", "20% polyester", "Gender-neutral"]
        }
    },
    methods: {
        addToCart: function () {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart: function () {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct: function (index) {
            this.selectedVariant = index;
            console.log(index);
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        print() {
            return this.brand + ' ' + this.product;
        },
        shipping() {
            if (this.premium) {
                return 'Free';
            }
            return '2.99;'
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    }
})


Vue.component('product-details', {
    props: {
        details: {
            required: true,
            default: 'Not available'
        }
    },
    template: `<ul>
            <li v-for="detail in details">{{detail}}</li>
        </ul>`
})


Vue.component('product-review', {
    template: `<form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
        <b>Please correct the following error(s): </b>
        <ul>
        <li v-for="error in errors">{{error}}</li>
</ul>
</p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
      
      <p>
      <label for="r1">Yes</label>
        <input type="radio" name="recommend" value="yes" id="r1" v-model="recommend">
      <label for="r2">No</label>  
        <input type="radio" name="recommend" value="no" id="r2" v-model="recommend">
    </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>`,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = null;
                this.errors = [];
            } else {
                if (!this.name) this.errors.push("Name required");
                if (!this.review) this.errors.push("Review required");
                if (!this.rating) this.errors.push("Rating required");
                if (!this.recommend) this.errors.push("Recommend required");
            }

        }
    }
})

Vue.component('products-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `<div>
                <span class="tab" 
                :class="{activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs" 
                :key="index"
                @click="selectedTab = tab"
                >{{ tab }}</span>
           
           <div v-show="selectedTab === 'Reviews'">
                <h2>Reviews</h2>
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                 <li v-for="review in reviews">
                 <p>{{review.name}}</p>
                 <p>{{review.rating}}</p>
                 <p>{{review.review}}</p>
                  <p>{{review.recommend}}</p>
                 </li>
                </ul>
                </div>
                
                 <product-review v-show="selectedTab === 'Make a review'"></product-review>
            </div>
           

`,
    data() {
        return {
            tabs: ['Reviews', 'Make a review'],
            selectedTab: 'Reviews'
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        premium: false,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            const index = this.cart.indexOf(id);
            if (index !== -1) this.cart.splice(index, 1);
        }
    }
})