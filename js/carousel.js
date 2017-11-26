
$(document).ready(function() {
    initImageList.init();
    slide.init();

});


var imageList = [
    "images/image1.jpg",
    "images/image2.jpg",
    "images/image3.jpg",
    "images/image4.jpg",
];

var initImageList = {
    //init
    init: function () {
        var self = this;
        self.initSlider();

    },
    shuffle: function(array) {
        var currentIndex = array.length, 
          temporaryValue, 
          randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    },
    initSlider: function() {
        var self = this,
           newImageArray = self.shuffle(imageList),
            image;

        //Creating list of elemetns
        for(image in newImageArray) {
            var list = $('<li/>', {
                class: 'item' + image,
                html: $('<img data-src='+ newImageArray[image] + ' src=' + newImageArray[image] + ' />')
            });
            $('.container').append(list);
        }
    },
};

var slide = {
    selectors: {
        containerMain: '.carousel',
        containerSlider: '.container',
        containerSliderList: '.container li',
        containerSliderListImage: '.container li img',
        containerBullets: '.carousel_bullets',
        modalContainer: '#myModal'
    },

    createObjects: function () {
        var self = this;

        self.$containerMain = $(self.selectors.containerMain);
        self.$containerSlider = $(self.selectors.containerSlider);
        self.$containerSliderList = $(self.selectors.containerSlider).children();
        self.$containerSliderListImage = $(self.selectors.containerSliderListImage);
        self.$modalContainer = $(self.selectors.modalContainer)

        self.$containerBullets = $(self.selectors.containerBullets);
        self.sliderImageWidth = self.$containerSliderListImage.width();
        self.sliderImageHeight = self.$containerSliderListImage.height();
        self.slideLength = self.$containerSliderList.length;
        self.timer = null;
        self.slideSteps = 1;
        self.percentage = 100 / (self.slideLength) ;
        self.direction = 1;
        self.currentIndex = 0;
        self.delayTime = 1000;
        self.slideSpeed = 500;
        self.carouselPadding = 20;
        self.sliderActiveBullet = 0;
        self.isMobile = window.matchMedia("only screen and (max-width: 768px)");
    },

    //init
    init: function () {
        var self = this;
        self.createObjects();
        self.bindEvents();
        self.startSlider();
        self.addBullets();
        self.resizeWindow();

        self.stopRestart = false;
    },

    startSlider: function() {
        var self = this;
        self.timer = setInterval(function() {
            self.carousel();
        }, this.delayTime);

        //Sets selected button
        self.setSelected();

    },

    restartSlider: function() {
        var self = this;

        clearInterval(self.timer);

        if (self.stopRestart) {
            return;
        }

        self.timer = setInterval(function() {
            self.carousel();
        }, 4000);
    },
  
    bindEvents: function () {
        var self = this;

        self.$containerBullets.on('click', '.bullet', function (e) {
            self.restartSlider();
            var imageNumber = $(this).index();
            self.goToImage(imageNumber);
        });

        //on click on the ime stop slider and open Modal popup
        self.$containerSliderList.on('click', 'img', function(e) {   
            self.stopRestart = true;
            clearInterval(self.timer);
            self.timer = null;
            self.$modalContainer.show();
            $('.modal-image').attr('src', $(this).attr('data-src'));

        });

        //Close Modal popup
        self.$modalContainer.on('click', '.close', function() {
            self.stopRestart = false;
            self.$modalContainer.hide();
            self.restartSlider();
        }); 

        //On hover stop slider
        self.$containerSliderList.on('mouseenter',function(){
           clearInterval(self.timer);
            self.timer = null;
        });

        //On mouse leave stop slider
        self.$containerSlider.on('mouseleave', function() {
           self.restartSlider();
        });
    },

    //init Carousel
    carousel: function() {
        var self = this;

        self.slideSteps=1;
        if(self.direction === 1) {
            if (self.currentIndex == self.slideLength - 1) {

                self.currentIndex = 0;
            }
            else {
                self.currentIndex++;
            }
            self.slidingRight();
        }
        else {
            if (self.currentIndex == 0) {
                self.currentIndex = self.slideLength - 1;
            }
            else {
                self.currentIndex--;
            }
            self.slidingLeft();
        }
        self.setSelected();
    },

    slidingLeft: function() {
        var self =  this;

        self.$containerSlider.css({ left: -self.sliderImageWidth * self.slideSteps });

        for (var i = 1; i <= self.slideSteps; i++) {
            self.$containerSlider.prepend(self.$containerSlider.children('li:last-child'));
        }

        self.$containerSlider.stop().animate({ left: 0}, self.slideSpeed, 'linear');
    },

    slidingRight: function() {
        var self = this;

        self.$containerSlider.stop().animate({ left: -self.sliderImageWidth  * self.slideSteps }, self.slideSpeed, function () {
            for (var i = 1; i <= self.slideSteps; i++) {
                $('li:last', this).after($("li:first", this));
            }
            $(this).css({ left: 0 });
        });
    },

    //Click image bullets
    goToImage: function (bulletNumber) {
        var self = this;

        if (self.currentIndex < bulletNumber) {
            self.direction=1;
            self.slideSteps = bulletNumber - self.currentIndex;
            self.currentIndex = bulletNumber;
            self.slidingRight();
            self.setSelected();
        }
        else if (self.currentIndex > bulletNumber) {
            self.slideSteps = self.currentIndex - bulletNumber;
            self.direction=-1;
            self.currentIndex = bulletNumber;
            self.setSelected();
            self.slidingLeft();
        }
    },

    //select current bullet
    setSelected: function() {
        var self = this;
        $('.bullet_selected').removeClass('bullet_selected');
        var selected = (Math.abs(parseInt((self.currentIndex+1)*self.sliderImageWidth)) / self.sliderImageWidth) % (self.slideLength+1);

        //Sets bullet as selected
        self.$containerBullets.find('.bullet:eq(' + self.currentIndex + ')').addClass('bullet_selected');
    },

    addBullets: function () {
        var self = this;

        if (self.slideLength > 1) {
            for (var i = 0; i < self.slideLength; i++) {
                self.$containerBullets.append('<li class="bullet"></li>');
            }
            //set first bullet as selected
            self.setSelected();
        }
    },

    resizeWindow: function() {
        var self = this,
            resizeTimer;

        self.resizeAllImage();

         $(window).on('resize', function (e) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                self.resizeAllImage();
            }, 100);
        });
    },

    resizeAllImage: function() {
        var self = this,
            fisrtLoad = true,
            imageTimeOut = null;
            
        self.restartSlider();

        if($('body').width() <= 716 ) {
            self.$containerSliderListImage.css('width', $('body').width());
        }
        else {
            self.$containerSliderListImage.css('width', ($('.carousel').outerWidth()/3-13));
            $('.left-shadow, .right-shadow').css('width', parseInt($('body').width()/3+7))
        }

        self.$containerMain.css('height', $('.container img').outerHeight());;
        self.sliderImageWidth = self.$containerSliderListImage.outerWidth();

        //check if images are loaded and set the container height
        self.$containerSliderListImage.load(function() {
            self.$containerMain.css('height', this.height);
        });  
    },
};
