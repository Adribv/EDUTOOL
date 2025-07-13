const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');

// Connect to MongoDB Atlas
const mongoURI = 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna.uno4ffz.mongodb.net/EDULIVES?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
  bufferCommands: true,
});

async function fixLessonPlanUrls() {
  try {
    console.log('🔍 Looking for lesson plan with title "327"...');
    
    // Find the lesson plan with title "327"
    const lessonPlan = await LessonPlan.findOne({ title: '327' });
    
    if (!lessonPlan) {
      console.log('❌ Lesson plan with title "327" not found');
      return;
    }
    
    console.log('✅ Found lesson plan:', lessonPlan.title);
    console.log('📄 Current fileUrl:', lessonPlan.fileUrl);
    console.log('📄 Current pdfUrl:', lessonPlan.pdfUrl);
    console.log('🎥 Current videoUrl:', lessonPlan.videoUrl);
    console.log('🔗 Current videoLink:', lessonPlan.videoLink);
    
    // Update the URLs with actual files from your uploads directory
    lessonPlan.fileUrl = '/uploads/lessonPlan/1746807737158-pic.jpg';
    lessonPlan.pdfUrl = '/uploads/lessonPlan/1746807737158-pic.jpg';
    
    // Update video URL - use the videoLink value or set a proper video URL
    if (lessonPlan.videoLink && lessonPlan.videoLink !== 'hellooo') {
      lessonPlan.videoUrl = lessonPlan.videoLink;
    } else {
      // Set a proper video URL (you can change this to any video you want)
      lessonPlan.videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    }
    
    // Save the updated lesson plan
    await lessonPlan.save();
    
    console.log('✅ Lesson plan updated successfully!');
    console.log('📄 New fileUrl:', lessonPlan.fileUrl);
    console.log('📄 New pdfUrl:', lessonPlan.pdfUrl);
    console.log('🎥 New videoUrl:', lessonPlan.videoUrl);
    console.log('🔗 videoLink remains:', lessonPlan.videoLink);
    
  } catch (error) {
    console.error('❌ Error updating lesson plan:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the update
fixLessonPlanUrls(); 