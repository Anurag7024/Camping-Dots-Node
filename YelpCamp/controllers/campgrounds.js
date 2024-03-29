const Campground = require('../models/campground')

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm =  (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res,next) => {      
   
    const campground = new Campground(req.body.campground);
    campground.image =  req.files.map(f => ({url: f.path , filename: f.filename}));
    campground.author = req.user._id; 
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampgrounds = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error','Cannot find the campground')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editForms = async(req,res)=>{
    const{id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampgrounds = async(req,res) => {
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path , filename: f.filename}));
    campground.image.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        await campground.updateOne({ $pull: {image: {filename: {$in: req.body.deleteImages}}}})
        console.log(campground)
    }
    req.flash('success','Successfully updated campgrounds!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampgrounds = async(req,res)=>{
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted');
    res.redirect('/campgrounds');
}