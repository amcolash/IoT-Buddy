#include <pebble.h>

#define STRING_LENGTH 30
#define NUM_ITEMS 3

static Window *s_main_window;
static MenuLayer *s_menu_layer;

typedef struct {
  GColor menu_bg;
  GColor menu_fg;
  GColor selected_bg;
  GColor selected_fg;
  char key[STRING_LENGTH];
} Settings;

static Settings settings;

// For now just allocating 30 length strings /shrug
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
  int index = cell_index->row;
  char temp[103];
  
  if (strlen(triggers[index].value) > 0) {
    snprintf(temp, 103, "%s (%s)", triggers[index].trigger, triggers[index].value);
  } else {
    snprintf(temp, 103, "%s", triggers[index].trigger);
  }
  
  menu_cell_basic_draw(ctx, cell_layer, triggers[index].name, temp, NULL);
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
    dict_write_cstring(out_iter, MESSAGE_KEY_TriggerEvent, triggers[which].trigger);
    dict_write_cstring(out_iter, MESSAGE_KEY_TriggerValue, triggers[which].value);
    dict_write_cstring(out_iter, MESSAGE_KEY_Key, settings.key);
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

static void refresh_menu() {
  menu_layer_set_normal_colors(s_menu_layer, settings.menu_bg, settings.menu_fg);
  menu_layer_set_highlight_colors(s_menu_layer, settings.selected_bg, settings.selected_fg);
}

static void main_window_load(Window *window) {
  //Create it - 12 is approx height of the top bar
  s_menu_layer = menu_layer_create(GRect(0, 0, 144, 168));

  //Let it receive clicks
  menu_layer_set_click_config_onto_window(s_menu_layer, window);

  //Give it its callbacks
  MenuLayerCallbacks callbacks = {
    .draw_row = (MenuLayerDrawRowCallback) draw_row_callback,
    .get_num_rows = (MenuLayerGetNumberOfRowsInSectionsCallback) num_rows_callback,
    .select_click = (MenuLayerSelectCallback) select_click_callback
  };
  menu_layer_set_callbacks(s_menu_layer, NULL, callbacks);
  
  // Init colors to default, loaded from storage later
  settings.menu_bg = GColorWhite;
  settings.menu_fg = GColorBlack;
  settings.selected_bg = GColorBlack;
  settings.selected_fg = GColorWhite;
  
  if (persist_exists(MESSAGE_KEY_Settings)) {
    persist_read_data(MESSAGE_KEY_Settings, &settings, sizeof(Settings));
  }
  
  refresh_menu();
  
  //Add to Window
  layer_add_child(window_get_root_layer(window), menu_layer_get_layer(s_menu_layer));
}

static void main_window_unload(Window *window) {
  // Destroy MenuLayer
  menu_layer_destroy(s_menu_layer);
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "got message!");
  
  // Read color preferences
  Tuple *bg_color_t = dict_find(iter, MESSAGE_KEY_BackgroundColor);
  if(bg_color_t) {
    settings.menu_bg = GColorFromHEX(bg_color_t->value->int32); 
  }

  Tuple *fg_color_t = dict_find(iter, MESSAGE_KEY_ForegroundColor);
  if(fg_color_t) {
    settings.menu_fg = GColorFromHEX(fg_color_t->value->int32); 
  }
  
  Tuple *bg_text_color_t = dict_find(iter, MESSAGE_KEY_BackgroundTextColor);
  if(bg_text_color_t) {
    settings.selected_bg = GColorFromHEX(bg_text_color_t->value->int32); 
  }

  Tuple *fg_text_color_t = dict_find(iter, MESSAGE_KEY_ForegroundTextColor);
  if(fg_text_color_t) {
    settings.selected_fg = GColorFromHEX(fg_text_color_t->value->int32);
  }
  
  Tuple *key_t = dict_find(iter, MESSAGE_KEY_Key);
  if(key_t) {
    strcpy(settings.key, key_t->value->cstring);
  }
  
  Tuple *trigger_name_t = dict_find(iter, MESSAGE_KEY_TriggerName);
  Tuple *trigger_event_t = dict_find(iter, MESSAGE_KEY_TriggerEvent);
  Tuple *trigger_value_t = dict_find(iter, MESSAGE_KEY_TriggerValue);
  Tuple *trigger_index_t = dict_find(iter, MESSAGE_KEY_TriggerIndex);
  if (trigger_name_t && trigger_event_t && trigger_index_t) {
    APP_LOG(APP_LOG_LEVEL_INFO, "Trigger name: %s", trigger_name_t->value->cstring);
    APP_LOG(APP_LOG_LEVEL_INFO, "Trigger event: %s", trigger_event_t->value->cstring);
    APP_LOG(APP_LOG_LEVEL_INFO, "Trigger value: %s", trigger_value_t->value->cstring);
    APP_LOG(APP_LOG_LEVEL_INFO, "Trigger index: %d", (int) trigger_index_t->value->int32);
  }
  
  
  persist_write_data(MESSAGE_KEY_Settings, &settings, sizeof(Settings));
  
  refresh_menu();
}

void trigger_init() {
  for (int i = 0; i < NUM_ITEMS; i++) {
    char temp[STRING_LENGTH];
    
    snprintf(temp, STRING_LENGTH, "Name_%d", i);
    strncpy(triggers[i].name, temp, STRING_LENGTH);
    
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
