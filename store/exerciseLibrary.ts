import { LibraryExercise } from './types';

// ─────────────────────────────────────────────
//  MASTER EXERCISE LIBRARY  (100+ exercises)
//  Organised by bodyPart → category
// ─────────────────────────────────────────────

export const EXERCISE_LIBRARY: LibraryExercise[] = [

  // ── CHEST ──────────────────────────────────
  { id: 'chest_001', name: 'Barbell Bench Press',           category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_002', name: 'Incline Barbell Bench Press',   category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_003', name: 'Decline Barbell Bench Press',   category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_004', name: 'Dumbbell Bench Press',          category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_005', name: 'Incline Dumbbell Press',        category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_006', name: 'Decline Dumbbell Press',        category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_007', name: 'Dumbbell Fly',                  category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_008', name: 'Incline Dumbbell Fly',          category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_014', name: 'Push-up',                       category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_015', name: 'Wide Push-up',                  category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Chest' },
  { id: 'chest_016', name: 'Diamond Push-up',               category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Chest' },
  // ── BACK ───────────────────────────────────
  { id: 'back_001',  name: 'Deadlift',                      category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_002',  name: 'Romanian Deadlift',             category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_006',  name: 'Pull-up',                       category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_007',  name: 'Chin-up',                       category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_008',  name: 'Neutral-Grip Pull-up',          category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_011',  name: 'Seated Cable Row',              category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_013',  name: 'Dumbbell Row',                  category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Back' },
  { id: 'back_014',  name: 'Incline Dumbbell Row',          category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Back' },
  // ── SHOULDERS ──────────────────────────────
  { id: 'sho_002',   name: 'Seated Dumbbell Press',         category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_003',   name: 'Arnold Press',                  category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_004',   name: 'Dumbbell Lateral Raise',        category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_005',   name: 'Cable Lateral Raise',           category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_006',   name: 'Dumbbell Front Raise',          category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_007',   name: 'Barbell Front Raise',           category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_009',   name: 'Dumbbell Rear Delt Fly',        category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_010',   name: 'Machine Shoulder Press',        category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  { id: 'sho_013',   name: 'Handstand Push-up',             category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Shoulders' },
  // ── ARMS ───────────────────────────────────
  { id: 'arm_004',   name: 'Hammer Curl',                   category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Arms' },
  { id: 'arm_005',   name: 'Incline Dumbbell Curl',         category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Arms' },
  { id: 'arm_006',   name: 'Concentration Curl',            category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Arms' },
  { id: 'arm_014',   name: 'Close-Grip Bench Press',        category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Arms' },
  { id: 'arm_015',   name: 'Triceps Dip',                   category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Arms' },
  { id: 'arm_017',   name: 'Wrist Curl',                    category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Arms' },
  { id: 'arm_018',   name: 'Reverse Wrist Curl',            category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Arms' },

  // ── LEGS ───────────────────────────────────
  { id: 'leg_001',   name: 'Squat',                         category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_002',   name: 'Front Squat',                   category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_003',   name: 'Hack Squat',                    category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_004',   name: 'Bulgarian Split Squat',         category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_005',   name: 'Goblet Squat',                  category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_008',   name: 'Seated Leg Curl',               category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_009',   name: 'Lying Leg Curl',                category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_010',   name: 'Romanian Deadlift (Dumbbell)',  category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_011',   name: 'Stiff-Leg Deadlift',            category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_012',   name: 'Walking Lunges',                category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_013',   name: 'Reverse Lunge',                 category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_016',   name: 'Donkey Calf Raise',             category: 'Machine',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_017',   name: 'Hip Thrust',                    category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_019',   name: 'Sumo Squat',                    category: 'Barbell',           exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_020',   name: 'Step-up',                       category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Legs' },
  { id: 'leg_022',   name: 'Sissy Squat',                   category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Legs' },

  // ── CORE ───────────────────────────────────
  { id: 'core_004',  name: 'Crunch',                        category: 'Reps Only',         exerciseType: 'reps_only', bodyPart: 'Core' },
  { id: 'core_007',  name: 'Hanging Leg Raise',             category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Core' },
  { id: 'core_008',  name: 'Hanging Knee Raise',            category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Core' },
  { id: 'core_010',  name: 'Decline Sit-up',                category: 'Weighted Bodyweight', exerciseType: 'weight_reps', bodyPart: 'Core' },
  { id: 'core_011',  name: 'Russian Twist',                 category: 'Dumbbell',          exerciseType: 'weight_reps', bodyPart: 'Core' },
  // ── OLYMPIC ────────────────────────────────
  // ── FULL BODY ──────────────────────────────
  { id: 'fb_004',    name: 'Burpee',                        category: 'Reps Only',         exerciseType: 'reps_only', bodyPart: 'Full Body' },
  // ── CARDIO ─────────────────────────────────
  { id: 'card_006',  name: 'Elliptical Trainer',           category: 'Cardio',            exerciseType: 'duration', bodyPart: 'Cardio' },
  { id: 'card_008',  name: 'Jump Rope',                    category: 'Cardio',            exerciseType: 'duration', bodyPart: 'Cardio' },
  { id: 'card_011',  name: 'Assault Bike',                 category: 'Cardio',            exerciseType: 'duration', bodyPart: 'Cardio' },
  { id: 'card_013',  name: 'Jumping Jack',                 category: 'Reps Only',         exerciseType: 'reps_only', bodyPart: 'Cardio' },
  { id: 'card_014',  name: 'Mountain Climber',             category: 'Reps Only',         exerciseType: 'reps_only', bodyPart: 'Cardio' }];

// Instructions for the ExerciseDetailsModal
export const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {

  // CHEST
  'Barbell Bench Press': [
    'Lie flat on a bench, feet firmly planted on the floor.',
    'Grip the barbell slightly wider than shoulder-width.',
    'Unrack the bar and hold it directly above your chest with arms extended.',
    'Lower the bar slowly to mid-chest, keeping elbows at ~75°.',
    'Press the bar back up explosively to full extension.'],
  'Incline Barbell Bench Press': [
    'Set the bench to a 30–45° incline.',
    'Grip the bar slightly wider than shoulder-width.',
    'Lower the bar to upper chest under control.',
    'Press back up to full arm extension.'],
  'Decline Barbell Bench Press': [
    'Set the bench to a 15–30° decline and secure your legs.',
    'Grip the barbell slightly wider than shoulder-width.',
    'Lower the bar to lower chest.',
    'Press back up to full arm extension.'],
  'Dumbbell Bench Press': [
    'Lie flat on a bench, holding a dumbbell in each hand at chest level.',
    'Press both dumbbells up until arms are fully extended.',
    'Squeeze the chest at the top, then lower under control.',
    'Keep wrists neutral and elbows at ~75° throughout.'],
  'Incline Dumbbell Press': [
    'Set bench to 30–45° incline.',
    'Hold dumbbells at shoulder level, palms facing forward.',
    'Press up and in, bringing dumbbells together at the top.',
    'Lower slowly to the starting position.'],
  'Decline Dumbbell Press': [
    'Set bench to a decline angle and secure your feet.',
    'Hold dumbbells at lower-chest level.',
    'Press up to full extension. Lower slowly.'],
  'Dumbbell Fly': [
    'Lie flat on a bench, dumbbells held above chest with a slight elbow bend.',
    'Open arms out wide in a wide arc, keeping the elbows slightly bent.',
    'Feel a deep stretch in the chest at the bottom.',
    'Squeeze the chest and bring the dumbbells back together at the top.'],
  'Incline Dumbbell Fly': [
    'Set bench to 30° incline. Hold dumbbells above upper chest.',
    'Lower in a wide arc until you feel a stretch in the upper chest.',
    'Bring the dumbbells back together at the top with control.'],
  'Cable Crossover': [
    'Set cables to the high position on both sides of a cable station.',
    'Stand in the centre with one foot forward, grab a handle in each hand.',
    'Bring your hands down and together in a sweeping arc, crossing slightly.',
    'Squeeze the chest at the centre. Return slowly.'],
  'Low Cable Fly': [
    'Set cables to the low position. Stand in the centre and grab both handles.',
    'With a slight bend in the elbows, draw hands upward and together.',
    'Pause at the top, squeezing the chest. Lower slowly.'],
  'High Cable Fly': [
    'Set cables to a high position. Grab handles and step forward.',
    'Pull handles downward and together in an arc.',
    'Squeeze at the bottom and return slowly.'],
  'Chest Press Machine': [
    'Sit in the machine and adjust the seat so handles are at chest height.',
    'Press the handles forward until arms are almost fully extended.',
    'Return slowly to the starting position without fully releasing the weight stack.'],
  'Pec Deck Fly': [
    'Sit in the machine with upper arms parallel to the floor on the arm pads.',
    'Bring the arm pads together in front of your chest.',
    'Squeeze and hold briefly, then return slowly.'],
  'Push-up': [
    'Start in a high plank with hands slightly wider than shoulder-width.',
    'Lower your chest toward the floor, keeping a straight body line.',
    'Push back up to full arm extension without flaring the elbows.'],
  'Wide Push-up': [
    'Place hands wider than shoulder-width in a high plank position.',
    'Lower your chest to the floor with elbows pointing out to the sides.',
    'Push back up and squeeze the chest at the top.'],
  'Diamond Push-up': [
    'Form a diamond shape with your thumbs and index fingers directly under your chest.',
    'Lower your chest toward your hands, keeping elbows close to the body.',
    'Push back up to full arm extension.'],
  'Around the World': [
    'Lie on a flat bench holding a dumbbell in each hand by your hips.',
    'With a slight elbow bend, arc the dumbbells up and overhead in a wide circle.',
    'Bring them together above your chest and reverse the movement.'],
  'Svend Press': [
    'Stand holding two small plates pressed together at chest height.',
    'Press the plates straight out in front of you while squeezing them together.',
    'Hold 1 second and pull them back in. Keep constant tension throughout.'],

  // BACK
  'Deadlift': [
    'Stand with feet hip-width apart, barbell over mid-foot.',
    'Hinge at the hips and bend knees to grip the bar just outside the legs.',
    'Take a big breath, brace your core, and keep your back straight.',
    'Drive through the floor, extending legs and hips simultaneously.',
    'Stand tall at the top, then lower the bar with control.'],
  'Romanian Deadlift': [
    'Stand with feet hip-width, barbell in an overhand grip.',
    'With knees slightly bent, hinge at the hips and push them back.',
    'Lower the bar along your legs until you feel a stretch in the hamstrings.',
    'Drive hips forward to return to standing. Keep back flat throughout.'],
  'Barbell Row': [
    'Stand over a barbell with feet shoulder-width apart. Hinge to ~45°.',
    'Grip the bar just outside your feet in an overhand grip.',
    'Pull the bar toward your lower chest/upper abdomen, driving elbows back.',
    'Lower the bar under control.'],
  'Pendlay Row': [
    'Set barbell on floor. Stand over it with feet shoulder-width apart.',
    'Hinge until torso is parallel to the floor.',
    'Explosively row the bar to your lower chest from a dead stop each rep.',
    'Lower it fully to the floor between each rep.'],
  'T-Bar Row': [
    'Load one end of a barbell fixed in a landmine or corner.',
    'Straddle the bar, hinge forward, and grip the handle near the collar.',
    'Row the bar toward your chest, driving elbows back.',
    'Lower under control.'],
  'Pull-up': [
    'Hang from a pull-up bar with an overhand grip slightly wider than shoulder-width.',
    'Engage your lats and pull yourself up until your chin clears the bar.',
    'Lower yourself under control to a dead hang.'],
  'Chin-up': [
    'Hang from a bar with an underhand (supinated) grip, hands shoulder-width apart.',
    'Pull yourself up until your chin is above the bar.',
    'Lower yourself slowly to the starting position.'],
  'Neutral-Grip Pull-up': [
    'Use parallel handles on a pull-up station, palms facing each other.',
    'Pull yourself up until your chin reaches handle height.',
    'Lower under control. Keep core braced.'],
  'Lat Pulldown': [
    'Sit at a lat pulldown machine with your thighs secured under the pad.',
    'Grip the bar wider than shoulder-width.',
    'Pull the bar down toward your upper chest, leading with your elbows.',
    'Squeeze the lats at the bottom, then slowly return to the top.'],
  'Close-Grip Lat Pulldown': [
    'Use a close-grip attachment and sit at a lat pulldown machine.',
    'Pull the bar toward your chin, driving elbows down and back.',
    'Slow and controlled return to the top.'],
  'Seated Cable Row': [
    'Sit with feet on footrests and a slight knee bend, holding a cable handle.',
    'Row the handle to your abdomen, keeping your back upright.',
    'Hold the contraction for a moment, then extend arms fully.'],
  'Close-Grip Seated Cable Row': [
    'Use a close-grip v-bar attachment. Sit upright on the cable row machine.',
    'Pull the bar to your midsection, squeezing shoulder blades together.',
    'Return slowly with arms fully extended.'],
  'Dumbbell Row': [
    'Place one knee and the same-side hand on a bench for support.',
    'Hold a dumbbell in the free hand, arm extended toward the floor.',
    'Row the dumbbell up toward your hip, driving the elbow back.',
    'Lower under control. Repeat on the other side.'],
  'Incline Dumbbell Row': [
    'Set bench to ~45° incline. Lie chest-down holding a dumbbell in each hand.',
    'Row both dumbbells up simultaneously, driving elbows back.',
    'Lower slowly. Keep core engaged.'],
  'Back Extension': [
    'Position yourself in a back extension bench, hips on the pad, feet secured.',
    'Lower your torso toward the floor, rounding slightly at the bottom.',
    'Raise your torso back to parallel to the floor. Squeeze glutes at the top.'],
  'Back Extension (Machine)': [
    'Sit in the machine with your back against the pad and feet secured.',
    'Push back against the pad, extending your spine.',
    'Return slowly to the starting position.'],
  'Good Morning': [
    'Place barbell on your upper traps with feet shoulder-width apart.',
    'With a slight knee bend and flat back, hinge at the hips until torso is near horizontal.',
    'Extend hips to return to standing. Keep core braced throughout.'],
  'Face Pull': [
    'Set a cable pulley to face height with a rope attachment.',
    'Grab the rope with both hands and step back to create tension.',
    'Pull the rope toward your face, separating your hands at the end of the movement.',
    'Elbows should flare out to the sides. Return slowly.'],
  'Straight-Arm Pulldown': [
    'Stand facing a high cable pulley with a straight bar attachment.',
    'With arms nearly straight, pull the bar down to your thighs.',
    'Focus on hinging at the shoulder, not bending the elbow.',
    'Return slowly overhead.'],

  // SHOULDERS
  'Overhead Press': [
    'Stand or sit with a barbell at shoulder height, just in front of the collarbone.',
    'Press the bar straight overhead, slightly behind the head at lockout.',
    'Lower the bar back to shoulder height under control.'],
  'Seated Dumbbell Press': [
    'Sit on a bench with back support, a dumbbell in each hand at shoulder level.',
    'Press both dumbbells up until fully extended.',
    'Lower slowly to the starting position.'],
  'Arnold Press': [
    'Sit with dumbbells at shoulder height, palms facing you.',
    'As you press up, rotate your palms outward so they face forward at the top.',
    'Reverse the rotation as you lower back to the start.'],
  'Dumbbell Lateral Raise': [
    'Stand with dumbbells at your sides.',
    'Raise both arms out to the sides until parallel to the floor, with a slight elbow bend.',
    'Lower slowly. Lead with your elbows, not your hands.'],
  'Cable Lateral Raise': [
    'Set cable to the low position. Stand sideways to the machine.',
    'With a slight elbow bend, raise your arm out to the side to shoulder height.',
    'Lower under control. Compete both sides.'],
  'Dumbbell Front Raise': [
    'Stand with dumbbells in front of your thighs.',
    'Raise one or both arms forward to shoulder height with a slight elbow bend.',
    'Lower slowly.'],
  'Barbell Front Raise': [
    'Stand holding a barbell in front of your thighs, overhand grip.',
    'Raise the bar forward to shoulder height.',
    'Lower slowly.'],
  'Reverse Pec Deck': [
    'Sit facing the pad of a pec deck machine, arms extended gripping the handles.',
    'Pull the handles back in a wide arc until arms are in line with your shoulders.',
    'Squeeze rear delts at the end range. Return slowly.'],
  'Dumbbell Rear Delt Fly': [
    'Hinge forward at the hips until your torso is almost parallel to the floor.',
    'Hold dumbbells hanging below your chest with a slight elbow bend.',
    'Raise arms out to the sides, squeezing rear delts at the top.',
    'Lower under control.'],
  'Machine Shoulder Press': [
    'Adjust the seat so handles align with your shoulders.',
    'Press both handles upward until arms are extended.',
    'Lower slowly. Do not fully release the weight stack.'],
  'Barbell Upright Row': [
    'Stand holding a barbell with a narrow overhand grip in front of your thighs.',
    'Pull the bar straight up toward your chin, leading with elbows.',
    'Elbows should finish higher than your hands. Lower under control.'],
  'Cable Upright Row': [
    'Attach a short straight bar to a low cable pulley.',
    'Pull the bar up to chin level, elbows leading.',
    'Lower smoothly.'],
  'Handstand Push-up': [
    'Kick into a handstand against a wall, hands shoulder-width apart.',
    'Lower your head toward the floor in a controlled manner.',
    'Press back up to a locked-out handstand.'],
  'Dumbbell Shrug': [
    'Stand holding dumbbells at your sides.',
    'Shrug your shoulders straight up toward your ears as high as possible.',
    'Hold briefly at the top, then lower slowly.'],
  'Barbell Shrug': [
    'Stand holding a barbell in front of you in an overhand grip.',
    'Shrug your shoulders up toward your ears, keeping arms straight.',
    'Hold at the top and lower under control.'],

  // ARMS
  'Barbell Curl': [
    'Stand holding a barbell with an underhand grip, hands shoulder-width apart.',
    'Keep elbows fixed at your sides and curl the bar toward your shoulders.',
    'Squeeze at the top, then lower slowly.'],
  'EZ-Bar Curl': [
    'Grip an EZ-curl bar at the inner angled grips (semi-supinated).',
    'Curl the bar up toward your shoulders, keeping elbows stationary.',
    'Lower under control.'],
  'Dumbbell Curl': [
    'Stand or sit holding dumbbells at your sides with palms facing in.',
    'Curl one or both dumbbells up while rotating the palm to face you.',
    'Squeeze the bicep at the top, then lower slowly.'],
  'Hammer Curl': [
    'Hold dumbbells with a neutral grip (palms facing each other).',
    'Curl both weights up simultaneously without rotating the wrists.',
    'Lower slowly, maintaining the neutral grip.'],
  'Incline Dumbbell Curl': [
    'Lie back on an incline bench at ~60°, holding dumbbells with arms hanging.',
    'Curl both dumbbells up. The incline gives a great bicep stretch at the bottom.',
    'Lower fully to the stretched position each rep.'],
  'Concentration Curl': [
    'Sit on a bench and lean slightly forward, bracing the back of your elbow on the inner thigh.',
    'Curl the dumbbell up toward your shoulder.',
    'Lower slowly. Switch arms after all reps are done.'],
  'Preacher Curl': [
    'Sit at a preacher curl bench, resting the back of your upper arms on the pad.',
    'Curl the bar or dumbbells up fully.',
    'Lower slowly to a full arm extension without dropping the weight.'],
  'Cable Curl': [
    'Attach a short bar to a low cable pulley.',
    'Stand and curl the bar toward your shoulders, keeping elbows fixed at your sides.',
    'Lower slowly back to the start.'],
  'Machine Curl': [
    'Sit at a bicep curl machine and place the backs of your upper arms on the pad.',
    'Curl the handles up to full contraction.',
    'Lower under controlled resistance.'],
  'Triceps Pushdown (Bar)': [
    'Attach a straight bar to a high cable pulley.',
    'Grip the bar overhand, elbows fixed at your sides.',
    'Push the bar down until arms are fully extended.',
    'Return slowly, not letting elbows lift.'],
  'Triceps Pushdown (Rope)': [
    'Attach a rope to a high cable pulley.',
    'Grip each end of the rope, elbows at sides.',
    'Push down and flare the rope ends out at the bottom.',
    'Return to the starting position slowly.'],
  'Overhead Triceps Extension': [
    'Hold a dumbbell overhead with both hands, elbows pointing forward.',
    'Lower the dumbbell behind your head by bending the elbows.',
    'Press back to the starting position, fully extending the arms.'],
  'Skull Crushers': [
    'Lie on a flat bench holding an EZ-bar or barbell above your head with arms extended.',
    'Bend only at the elbows to lower the bar toward your forehead.',
    'Extend back to the starting position.'],
  'Close-Grip Bench Press': [
    'Lie on a flat bench. Grip the barbell with hands ~6 inches apart.',
    'Lower the bar to your lower chest, keeping elbows close to the body.',
    'Press back to full extension.'],
  'Triceps Dip': [
    'Grip parallel bars and raise yourself to arm-length. Lean forward slightly.',
    'Lower your body by bending the elbows until upper arms are parallel to the floor.',
    'Push back up to the starting position.'],
  'Kickback': [
    'Hinge forward at the hips, holding a dumbbell with elbow bent to 90°.',
    'Extend the forearm back until the arm is fully straight.',
    'Return to 90° and repeat. Switch arms.'],
  'Wrist Curl': [
    'Sit on a bench, forearms resting on thighs with palms facing up, holding a barbell.',
    'Let the wrists extend (drop), then curl them up as far as possible.',
    'Lower slowly.'],
  'Reverse Wrist Curl': [
    'Same position as wrist curl but with palms facing down.',
    'Curl the wrists up against gravity.',
    'Lower slowly.'],

  // LEGS
  'Squat': [
    'Stand with feet shoulder-width apart, barbell on your upper traps.',
    'Brace your core and push your hips back as you bend your knees.',
    'Lower until thighs are parallel to the floor (or below).',
    'Drive through the floor to stand back up.'],
  'Front Squat': [
    'Place the barbell on the front of your shoulders in a clean grip or cross-arm position.',
    'Keep an upright torso as you squat down to parallel.',
    'Drive up through the heels.'],
  'Hack Squat': [
    'Place your shoulders and back against the pads of the machine.',
    'Feet shoulder-width on the platform. Lower by bending the knees.',
    'Push back up to the starting position.'],
  'Bulgarian Split Squat': [
    'Stand in front of a bench. Reach one foot back and place it on the bench.',
    'Lower your rear knee toward the floor, keeping your front shin vertical.',
    'Drive through the front heel to return to start.'],
  'Goblet Squat': [
    'Hold a dumbbell or kettlebell vertically at chest height.',
    'Squat down with an upright torso, elbows tracking inside the knees at the bottom.',
    'Drive up to standing.'],
  'Leg Press': [
    'Sit in the leg press machine with feet shoulder-width on the platform.',
    'Lower the platform by bending knees to ~90°.',
    'Press back up, stopping just before locking out.'],
  'Leg Extension': [
    'Sit in the machine with the pad resting just above your ankles.',
    'Extend your legs until fully straight.',
    'Lower the weight slowly. Do not use momentum.'],
  'Seated Leg Curl': [
    'Sit in the machine with the pad on the backs of your ankles.',
    'Curl your legs down and back as far as possible.',
    'Return slowly to the starting position.'],
  'Lying Leg Curl': [
    'Lie face-down on the machine, pad resting against your lower legs.',
    'Curl the weight up toward your glutes as far as possible.',
    'Lower under control.'],
  'Romanian Deadlift (Dumbbell)': [
    'Stand holding dumbbells in front of your thighs.',
    'Hinge at the hips, pushing them back while lowering the dumbbells along your legs.',
    'Feel the hamstring stretch, then drive hips forward to return.'],
  'Stiff-Leg Deadlift': [
    'Hold a barbell with legs nearly straight.',
    'Hinge at the hips and lower the bar toward the floor.',
    'Return to standing by squeezing glutes and extending hips.'],
  'Walking Lunges': [
    'Stand holding dumbbells at your sides.',
    'Step forward with one leg, lowering your rear knee close to the floor.',
    'Push off the front foot and bring the rear foot forward to take the next step.',
    'Alternate legs for the prescribed distance or reps.'],
  'Reverse Lunge': [
    'Stand holding dumbbells. Step one foot back and lower the rear knee toward the floor.',
    'Keep the front shin vertical and the torso upright.',
    'Push through the front foot to return to start.'],
  'Calf Raises (Standing)': [
    'Stand on the edge of a step or platform with heels hanging off.',
    'Rise onto your toes as high as possible.',
    'Lower heels below the step to get a full stretch, then repeat.'],
  'Calf Raises (Seated)': [
    'Sit in the machine with the pad on your thighs and the balls of your feet on the platform.',
    'Push through the balls of your feet to raise your heels.',
    'Lower for a full stretch and repeat.'],
  'Donkey Calf Raise': [
    'Bend over and support yourself on a platform or padded bar at waist height.',
    'With your feet on an edge, perform calf raises getting a full range of motion.'],
  'Hip Thrust': [
    'Sit with your upper back against a bench, a barbell across your hips.',
    'Plant your feet flat and drive your hips up toward the ceiling.',
    'Squeeze glutes hard at the top. Lower hips and repeat.'],
  'Glute Kickback (Cable)': [
    'Attach an ankle strap to a low cable. Stand facing the machine.',
    'Kick the leg back and upward, squeezing the glute at the top.',
    'Lower slowly and repeat. Switch legs.'],
  'Sumo Squat': [
    'Take a very wide stance with toes pointed out ~45°.',
    'Squat down, keeping your torso upright and knees tracking over toes.',
    'Drive up through the heels.'],
  'Step-up': [
    'Stand in front of a sturdy box or bench, holding dumbbells.',
    'Step one foot onto the box, drive through the heel to bring the other foot up.',
    'Step back down and repeat on the other leg.'],
  'Nordic Curl': [
    'Kneel with feet anchored under a secure object or pad.',
    'Lower your body toward the floor by extending at the knees, keeping hips straight.',
    'Use your hands to push back up from the floor, then pull yourself back up with your hamstrings.'],
  'Sissy Squat': [
    'Stand beside a support and hold it lightly for balance.',
    'Rise onto your toes and lean back, bending your knees.',
    'Lower until knees are near the floor. Drive back up.'],

  // CORE
  'Ab Wheel': [
    'Kneel on the floor holding the ab wheel with both hands.',
    'Place the wheel on the floor in front of you.',
    'Roll forward, extending your body as far as possible without touching the floor.',
    'Roll back to the starting position using your core.'],
  'Plank': [
    'Lie face down and raise yourself onto your forearms and toes.',
    'Keep your body in a straight line from head to heels.',
    'Brace your core and hold for the prescribed duration.'],
  'Side Plank': [
    'Lie on your side and raise yourself onto one forearm and the side of your foot.',
    'Keep your body in a straight line. Brace your core.',
    'Hold for the prescribed duration, then switch sides.'],
  'Crunch': [
    'Lie on your back with knees bent, hands behind your head or across chest.',
    'Curl your shoulders toward your knees using your abs.',
    'Lower back slowly to the floor.'],
  'Bicycle Crunch': [
    'Lie on your back, hands behind your head, knees raised to 90°.',
    'Alternate bringing each elbow toward the opposite knee while extending the other leg.',
    'Move in a slow, controlled bicycle-pedalling motion.'],
  'Sit-up': [
    'Lie on your back, knees bent and feet flat on the floor.',
    'Sit all the way up until your upper body is nearly vertical.',
    'Lower back slowly under control.'],
  'Hanging Leg Raise': [
    'Hang from a pull-up bar with arms fully extended.',
    'Raise your legs until they are parallel to the floor (or higher).',
    'Lower slowly without swinging.'],
  'Hanging Knee Raise': [
    'Hang from a pull-up bar.',
    'Bring your knees up toward your chest, rounding your lower back.',
    'Lower slowly to full extension.'],
  'Cable Crunch': [
    'Attach a rope to a high cable pulley. Kneel below it, holding the rope at either side of your head.',
    'Crunch downward, bringing your elbows toward your knees.',
    'Feel the abs contract hard. Return slowly.'],
  'Decline Sit-up': [
    'Anchor your feet at the top of a decline bench.',
    'Lie back and sit all the way up, hands behind your head or arms crossed.',
    'Lower back slowly.'],
  'Russian Twist': [
    'Sit with knees bent, feet lifted slightly off the floor, leaning back ~45°.',
    'Hold a weight with both hands. Rotate your torso from side to side.',
    'Touch the weight to the floor on each side for a full rep.'],
  'Pallof Press': [
    'Attach a cable at chest height and stand sideways to the machine.',
    'Hold the handle with both hands at your sternum.',
    'Press straight out in front for 2 seconds, resisting rotation.',
    'Bring hands back in. Complete all reps and switch sides.'],
  'Woodchop': [
    'Set a cable to high or low position. Stand sideways to the cable.',
    'Pull the cable diagonally across your body in a chopping motion.',
    'Rotate at the hips and torso, not just the arms.',
    'Return slowly and repeat. Switch sides.'],
  'Toe-to-Bar': [
    'Hang from a pull-up bar with a slightly wider than shoulder-width grip.',
    'Engage lats and raise your legs, keeping them straight, until toes touch the bar.',
    'Lower slowly with control.'],
  'Dragon Flag': [
    'Lie on a flat bench and grip it behind your head.',
    'Raise your entire body up into a vertical position, supported by your upper back.',
    'Lower your body toward horizontal under control. Do not touch the bench.',
    'Raise back up to vertical.'],
  'L-Sit': [
    'Support yourself on two parallel bars or the floor with arms locked out.',
    'Raise your legs until they are parallel to the floor.',
    'Hold this position for the prescribed duration.'],
  'Dead Bug': [
    'Lie on your back, arms extended toward the ceiling, knees at 90° above hips.',
    'Slowly lower the opposite arm and leg toward the floor simultaneously.',
    'Return to start and repeat on the opposite side. Keep lower back pressed flat.'],
  'Hollow Body Hold': [
    'Lie on your back and press your lower back into the floor.',
    'Raise your arms overhead and lift your legs to ~45°.',
    'Hold this banana-like hollow position for the prescribed time.'],
  'Landmine Rotation': [
    'Place one end of a barbell in a landmine anchor or corner.',
    'Hold the other end with both hands at chest height.',
    'Rotate the bar from side to side by pivoting at the hips and shoulders.'],
  'Ab Machine Crunch': [
    'Sit in the ab machine, gripping the handles at head level.',
    'Crunch your elbows toward your knees against the resistance.',
    'Hold a brief contraction, then return slowly.'],

  // OLYMPIC
  'Power Clean': [
    'Stand with feet hip-width, barbell mid-foot. Take a hook grip.',
    'Pull the bar from the floor with a powerful leg and hip extension.',
    'As the bar rises, quickly drop under it and catch it on your front shoulders in a partial squat.',
    'Stand to complete the lift.'],
  'Clean & Jerk': [
    'Clean the barbell to the front rack position (front shoulders).',
    'Dip your knees slightly, then drive powerfully upward.',
    'Split your feet front-to-back and press the bar overhead in one movement.',
    'Stand to full extension with feet together.'],
  'Snatch': [
    'Stand with a wide grip on the barbell. Pull it from the floor explosively.',
    'Using a fast pull, extend legs and hips fully, then drop under the bar.',
    'Catch the bar overhead with arms locked out in a squat.',
    'Stand to complete the lift.'],
  'Hang Clean': [
    'Start with the barbell at the hang position (hip or knee level).',
    'Dip and drive explosively to generate upward momentum.',
    'Drop under the bar and catch it in the front rack position.'],
  'Push Press': [
    'Start with the barbell in the front rack position.',
    'Dip slightly at the knees, then drive your legs to push the bar overhead.',
    'Lock out the arms. Lower under control.'],
  'Push Jerk': [
    'Front rack position. Dip and drive powerfully with the legs.',
    'As the bar rises, quickly dip again underneath it to get under the bar.',
    'Catch the bar with arms locked out and stand to complete.'],
  'Hang Snatch': [
    'Hold the bar at the hang position with a wide snatch grip.',
    'Explosively extend the hips and shrug, then pull yourself under the bar.',
    'Catch it overhead with arms fully extended and stand.'],

  // FULL BODY
  'Kettlebell Swing': [
    'Stand with feet just wider than hip-width, kettlebell between your feet.',
    'Hinge at the hips and swing the kettlebell back between your legs.',
    'Drive hips forward explosively to swing the bell to shoulder height.',
    'Let the bell swing back down and hinge at the hips again immediately.'],
  'Kettlebell Turkish Get-up': [
    'Lie on the floor holding a kettlebell in one hand, arm extended.',
    'Bend the same-side knee and use the opposite elbow to rise up.',
    'Continue pressing up through a kneeling lunge to standing.',
    'Reverse every step to return to the floor. Switch arms.'],
  'Battle Ropes': [
    'Hold one end of each rope with a neutral grip.',
    'Alternate raising and lowering each arm rapidly, creating waves in the ropes.',
    'Keep a slight knee bend and an athletic stance throughout.'],
  'Burpee': [
    'Stand, then squat down and place hands on the floor.',
    'Jump your feet back to a plank position.',
    'Perform a push-up (optional), then jump feet forward.',
    'Jump explosively with arms overhead. Land soft and repeat.'],
  'Ball Slams': [
    'Stand holding a medicine ball overhead.',
    'Slam the ball into the floor as hard as possible.',
    'Catch the bounce (or pick it back up) and repeat.'],
  'Farmer\'s Walk': [
    'Pick up a heavy dumbbell or kettlebell in each hand.',
    'Walk for the prescribed distance while keeping your torso tall and core braced.',
    'Set down with control.'],
  'Sandbag Carry': [
    'Lift any variation of sandbag carry—bear hug, shoulder, or overhead.',
    'Walk the prescribed distance with a braced core.'],
  'Sled Push': [
    'Load the sled with an appropriate weight. Lean into the handles.',
    'Drive through the balls of your feet in short, powerful strides.',
    'Keep hips down and back flat throughout.'],
  'Thrusters': [
    'Start with barbell in front rack position, feet shoulder-width.',
    'Squat down to parallel, then drive up explosively.',
    'Use the momentum of the squat to press the bar overhead.',
    'Lower bar back to front rack and repeat.'],
  'Wall Ball': [
    'Hold a medicine ball at chest, feet shoulder-width.',
    'Squat down, then drive up explosively and throw the ball to a target on the wall.',
    'Catch the ball as it bounces back and immediately squat into the next rep.'],

  // CARDIO
  'Running (Treadmill)': [
    'Step onto the treadmill and set speed and incline.',
    'Maintain an upright posture with a slight forward lean.',
    'Land mid-foot and use a natural arm swing.',
    'Cool down with a 2–3 min walk at the end.'],
  'Running (Outdoor)': [
    'Warm up with a 5 min brisk walk.',
    'Run at your target pace, keeping an upright posture.',
    'Breathe rhythmically. Cool down with a walk.'],
  'Cycling (Stationary)': [
    'Adjust the seat so your knee has a slight bend at the bottom of the pedal stroke.',
    'Pedal at a smooth, consistent cadence.',
    'Adjust resistance as needed to reach target heart rate.'],
  'Cycling (Outdoor)': [
    'Wear a helmet and check your bike before riding.',
    'Maintain a cadence of 80–100 RPM where possible.',
    'Use gears to manage effort on hills.'],
  'Rowing Machine': [
    'Sit with feet strapped in. Grip the handle with an overhand grip.',
    'Drive through the legs first, then lean back and pull the handle to lower chest.',
    'Return by pushing hands forward, then leaning forward before bending the knees.'],
  'Elliptical Trainer': [
    'Step onto the machine and grab the moving handles.',
    'Pedal in a smooth oval motion, driving with both legs and arms.',
    'Set resistance and incline to match your target intensity.'],
  'Stair Climber': [
    'Step onto the machine and hold the rails lightly.',
    'Drive through alternate legs in a smooth stepping motion.',
    'Keep a tall posture; avoid leaning heavily on the rails.'],
  'Jump Rope': [
    'Hold one handle in each hand, rope behind you.',
    'Swing the rope overhead and jump with both feet on each rotation.',
    'Land softly on the balls of your feet. Keep jumps small and compact.'],
  'Aerobics': [
    'Follow the prescribed aerobics routine or class format.',
    'Keep a consistent pace that elevates heart rate.',
    'Focus on form and coordination with each movement.'],
  'Swimming': [
    'Push off the wall and begin your chosen stroke.',
    'Maintain a streamlined body position in the water.',
    'Breathe bilaterally (both sides) for front crawl.'],
  'Assault Bike': [
    'Adjust the seat height. Grip the moving handles.',
    'Drive hard with legs and arms simultaneously.',
    'Set the interval or duration and push to the target effort.'],
  'Box Jump': [
    'Stand in front of a sturdy box, feet shoulder-width.',
    'Swing arms back and load the hips.',
    'Jump, landing softly on top of the box with hips and knees slightly bent.',
    'Step back down and reset.'],
  'Jumping Jack': [
    'Stand with feet together and arms at your sides.',
    'Jump, spreading feet out and raising arms overhead simultaneously.',
    'Return to starting position and repeat.'],
  'Mountain Climber': [
    'Start in a high plank position.',
    'Drive one knee toward your chest, then quickly switch legs.',
    'Keep hips level and core braced throughout.'],
  'Sprint Intervals': [
    'After a warm-up, sprint at maximum effort for the prescribed time or distance.',
    'Rest or jog for the recovery period.',
    'Repeat for the prescribed number of rounds.'],
};
