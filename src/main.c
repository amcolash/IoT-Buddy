#include <pebble.h>

#define NUM_ITEMS 3
#define STRING_LENGTH 50

static Window *s_main_window;
static MenuLayer *s_menu_layer;

static GColor menu_bg;
static GColor menu_fg;

// For now just allocating 50 length strings /shrug
struct trigger {
  char name[STRING_LENGTH];
  char trigger[STRING_LENGTH];
  char value[STRING_LENGTH];
};

struct trigger triggers[NUM_ITEMS];

uint16_t num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *callback_context) {
  return NUM_ITEMS;
}

void draw_row_callback(GContext *ctx, Layer *cell_layer, MenuIndex *cell_index, void *callback_context) {
  // Draw menu item using triggers array
  char temp[103];
  snprintf(temp, 103, "%s (%s)", triggers[cell_index->row].trigger, triggers[cell_index->row].value);
  
  menu_cell_basic_draw(ctx, cell_layer, triggers[cell_index->row].name, temp, NULL);
}

void select_click_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context) {
  //Get which row
  int which = cell_index->row;

  vibes_long_pulse();

  // Declare the dictionary's iterator
  DictionaryIterator *out_iter;

  // Prepare the outbox buffer for this message
  AppMessageResult result = app_message_outbox_begin(&out_iter);
  if(result == APP_MSG_OK) {
    // Add trigger name and value to the message
    dict_write_cstring(out_iter, MESSAGE_KEY_TriggerName, triggers[which].name);
    dict_write_cstring(out_iter, MESSAGE_KEY_TriggerTrigger, triggers[which].trigger);
    dict_write_cstring(out_iter, MESSAGE_KEY_TriggerValue, triggers[which].value);
  } else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }

  // Send this message
  result = app_message_outbox_send();

  // Check the result
  if(result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
  }
}

static void main_window_load(Window *window) {
  //Create it - 12 is approx height of the top bar
  s_menu_layer = menu_layer_create(GRect(0, 0, 144, 168 - 16));

  //Let it receive clicks
  menu_layer_set_click_config_onto_window(s_menu_layer, window);

  //Give it its callbacks
  MenuLayerCallbacks callbacks = {
    .draw_row = (MenuLayerDrawRowCallback) draw_row_callback,
    .get_num_rows = (MenuLayerGetNumberOfRowsInSectionsCallback) num_rows_callback,
    .select_click = (MenuLayerSelectCallback) select_click_callback
  };
  menu_layer_set_callbacks(s_menu_layer, NULL, callbacks);

  //Add to Window
  layer_add_child(window_get_root_layer(window), menu_layer_get_layer(s_menu_layer));
}

static void main_window_unload(Window *window) {
  // Destroy MenuLayer
  menu_layer_destroy(s_menu_layer);
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "got message!");
  Tuple *bg_color_t = dict_find(iter, MESSAGE_KEY_BackgroundColor);
  if(bg_color_t) {
    GColor bg_color = GColorFromHEX(bg_color_t->value->int32);
//     s_menu_layer
  }

  Tuple *fg_color_t = dict_find(iter, MESSAGE_KEY_ForegroundColor);
  if(fg_color_t) {
    GColor fg_color = GColorFromHEX(fg_color_t->value->int32);
  }

  Tuple *second_tick_t = dict_find(iter, MESSAGE_KEY_SecondTick);
  if(second_tick_t) {
    bool second_ticks = second_tick_t->value->int32 == 1;
  }

  Tuple *animations_t = dict_find(iter, MESSAGE_KEY_Animations);
  if(animations_t) {
    bool animations = animations_t->value->int32 == 1;
  }
}

void trigger_init() {
  for (int i = 0; i < NUM_ITEMS; i++) {
    char temp[STRING_LENGTH];
    
    snprintf(temp, STRING_LENGTH, "Name_%d", i);
    strncpy(triggers[i].name, temp, STRING_LENGTH);
    
//     snprintf(temp, STRING_LENGTH, "Trigger_%d", i);
    snprintf(temp, STRING_LENGTH, "test");
    strncpy(triggers[i].trigger, temp, STRING_LENGTH);
    
    snprintf(temp, STRING_LENGTH, "Value_%d", i);
    strncpy(triggers[i].value, temp, STRING_LENGTH);
  }
}

void inbox_init() {
  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(128, 128);
}

static void init() {
  // Initialize triggers
  trigger_init();
  
  // Create main Window element and assign to pointer
  s_main_window = window_create();

  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });

  // Show the Window on the watch, with animated=true
  window_stack_push(s_main_window, true);

  inbox_init();
}

static void deinit() {
  // Destroy Window
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
