#include <pebble.h>

#define STRING_LENGTH 21
#define KEY_LENGTH 40
#define ARRAY_SIZE 4
#define TIMEOUT 5

static Window* s_main_window;
static MenuLayer* s_menu_layer = NULL;
static TextLayer* s_text_layer = NULL;

AppTimer *timer;

typedef struct {
  GColor menu_bg;
  GColor menu_fg;
  GColor selected_bg;
  GColor selected_fg;
  char key[KEY_LENGTH];
  int num_items;
} Settings;

// For now just allocating 30 length strings /shrug
typedef struct {
  char name[STRING_LENGTH];
  char trigger[STRING_LENGTH];
  char value[STRING_LENGTH];
} Trigger;

Settings settings;
Trigger *triggers = NULL;

// Temp array but defined golbally so I do not need to dynamically allocate it on new trigger messages recieved
Trigger temp[ARRAY_SIZE];


static void refresh_menu() {
  if (persist_exists(MESSAGE_KEY_Settings)) {
    if (s_menu_layer != NULL) {
      menu_layer_set_normal_colors(s_menu_layer, settings.menu_bg, settings.menu_fg);
      menu_layer_set_highlight_colors(s_menu_layer, settings.selected_bg, settings.selected_fg);
  
      menu_layer_reload_data(s_menu_layer);
    }
    
    layer_set_hidden(text_layer_get_layer(s_text_layer), settings.num_items > 0);
  }
}

static void verticalAlignTextLayer(TextLayer *layer) {
  GRect frame = layer_get_frame(text_layer_get_layer(layer));
  GSize content = text_layer_get_content_size(layer);
  layer_set_frame(text_layer_get_layer(layer),
      GRect(frame.origin.x, frame.origin.y + (frame.size.h - content.h - 5) / 2, frame.size.w, content.h));
}

static void clear_temp() {
  for (int i = 0; i < ARRAY_SIZE; i++) {
    memset(temp[i].name, 0, STRING_LENGTH);
    memset(temp[i].trigger, 0, STRING_LENGTH);
    memset(temp[i].value, 0, STRING_LENGTH);
  }
}

uint16_t num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *callback_context) {
  if (persist_exists(MESSAGE_KEY_Settings)) {
    return settings.num_items;
  }
  
  return 0;
}

void draw_row_callback(GContext *ctx, Layer *cell_layer, MenuIndex *cell_index, void *callback_context) {
  // Draw menu item using triggers array
  int index = cell_index->row;
  char temp[STRING_LENGTH];
  
  if (persist_exists(MESSAGE_KEY_Settings) && settings.num_items > 0) {
    if (strlen(triggers[index].value) > 0) {
      snprintf(temp, STRING_LENGTH, "%s (%s)", triggers[index].trigger, triggers[index].value);
    } else {
      snprintf(temp, STRING_LENGTH, "%s", triggers[index].trigger);
    }
    
    menu_cell_basic_draw(ctx, cell_layer, triggers[index].name, temp, NULL);
  }
}

void select_click_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context) {
  //Get which row
  int which = cell_index->row;

  app_timer_reschedule(timer, TIMEOUT * 60 * 1000);
  
  if (persist_exists(MESSAGE_KEY_Settings) && settings.num_items > 0) {
    // Declare the dictionary's iterator
    DictionaryIterator *out_iter;
  
    // Prepare the outbox buffer for this message
    AppMessageResult result = app_message_outbox_begin(&out_iter);
    if(result == APP_MSG_OK) {
      // Add trigger name and value to the message
      dict_write_cstring(out_iter, MESSAGE_KEY_TriggerEvent, triggers[which].trigger);
      if (strlen(triggers[which].value) > 0) {
        dict_write_cstring(out_iter, MESSAGE_KEY_TriggerValue, triggers[which].value);
      }
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
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
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
  
  Tuple *trigger_list_length_t = dict_find(iter, MESSAGE_KEY_TriggerListLength);
  if(trigger_list_length_t) {
    settings.num_items = trigger_list_length_t->value->int32;
    
    triggers = realloc(triggers, settings.num_items * sizeof(Trigger));
    
    if (settings.num_items == 0) {
      refresh_menu();
    }
  }
  
  Tuple *trigger_success_t = dict_find(iter, MESSAGE_KEY_TriggerSuccess);
  if (trigger_success_t) {
    vibes_short_pulse();
  }
  
  // Write new settings to watch persistent storage
  persist_write_data(MESSAGE_KEY_Settings, &settings, sizeof(Settings));
  
  Tuple *trigger_name_t = dict_find(iter, MESSAGE_KEY_TriggerName);
  Tuple *trigger_event_t = dict_find(iter, MESSAGE_KEY_TriggerEvent);
  Tuple *trigger_value_t = dict_find(iter, MESSAGE_KEY_TriggerValue);
  Tuple *trigger_index_t = dict_find(iter, MESSAGE_KEY_TriggerIndex);
  if (trigger_name_t && trigger_event_t && trigger_index_t) {
    int i = (int) trigger_index_t->value->int32;
    
    snprintf(temp[i % ARRAY_SIZE].name, STRING_LENGTH, "%s", trigger_name_t->value->cstring);
    snprintf(triggers[i].name, STRING_LENGTH, "%s", trigger_name_t->value->cstring);
    
    snprintf(temp[i % ARRAY_SIZE].trigger, STRING_LENGTH, "%s", trigger_event_t->value->cstring);
    snprintf(triggers[i].trigger, STRING_LENGTH, "%s", trigger_event_t->value->cstring);
    
    if (trigger_value_t) {
      snprintf(temp[i % ARRAY_SIZE].value, STRING_LENGTH, "%s", trigger_value_t->value->cstring);
      snprintf(triggers[i].value, STRING_LENGTH, "%s", trigger_value_t->value->cstring);
    }
    
    refresh_menu();
    
    // Save every ARRAY_SIZE items, and at end (less writes than each individual trigger)
    if (i % ARRAY_SIZE == ARRAY_SIZE - 1 || i == settings.num_items - 1) {
      uint32_t key = 0;
      
      if (i < ARRAY_SIZE * 1) {
        key = MESSAGE_KEY_Triggers1;
      } else if (i < ARRAY_SIZE * 2) {
        key = MESSAGE_KEY_Triggers2;
      } else if (i < ARRAY_SIZE * 3) {
        key = MESSAGE_KEY_Triggers3;
      } else if (i < ARRAY_SIZE * 4) {
        key = MESSAGE_KEY_Triggers4;
      }
      
      if (key > 0) {
        persist_write_data(key, temp, settings.num_items * sizeof(Trigger));
        clear_temp();
      }
    }
    
  }
}

static void timer_callback() {
  window_stack_pop_all(true);
}

static void init_chunk(uint32_t key, int offset) {
  if (persist_exists(key)) {
    clear_temp();
    
    persist_read_data(key, temp, ARRAY_SIZE * sizeof(Trigger));
    for (int i = 0; i < ARRAY_SIZE; i++) {
      if (offset + i < settings.num_items) {
        snprintf(triggers[i + offset].name, STRING_LENGTH, "%s", temp[i].name);
        snprintf(triggers[i + offset].trigger, STRING_LENGTH, "%s", temp[i].trigger);
        snprintf(triggers[i + offset].value, STRING_LENGTH, "%s", temp[i].value);
        
        APP_LOG(APP_LOG_LEVEL_INFO, "temp[%d]: %s, %s, %s", i, temp[i].name,
            temp[i].trigger, temp[i].value);
      }
    }
  }
}

static void main_window_load(Window *window) {
  // Init colors to default, loaded from storage later
  settings.menu_bg = GColorWhite;
  settings.menu_fg = GColorBlack;
  settings.selected_bg = GColorBlack;
  settings.selected_fg = GColorWhite;
  settings.num_items = 0;
  
  if (persist_exists(MESSAGE_KEY_Settings)) {
    persist_read_data(MESSAGE_KEY_Settings, &settings, sizeof(Settings));
    
    if (settings.num_items > 0) {
      triggers = realloc(triggers, settings.num_items * sizeof(Trigger));
      
      init_chunk(MESSAGE_KEY_Triggers1, ARRAY_SIZE * 0);
      init_chunk(MESSAGE_KEY_Triggers2, ARRAY_SIZE * 1);
      init_chunk(MESSAGE_KEY_Triggers3, ARRAY_SIZE * 2);
      init_chunk(MESSAGE_KEY_Triggers4, ARRAY_SIZE * 3);
    }
  }
  
  // Init timer here, that way every time we reschedule we can use the simpler method
  timer = app_timer_register(TIMEOUT * 60 * 1000, (AppTimerCallback) timer_callback, NULL);
  
  // Add a text layer that explains that the user needs to configure the app
  s_text_layer = text_layer_create(GRect(0, 0, PBL_DISPLAY_WIDTH, PBL_DISPLAY_HEIGHT));
  text_layer_set_text(s_text_layer, "Please configure this app before you use it.");
  text_layer_set_font(s_text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);
  verticalAlignTextLayer(s_text_layer);
  
  // Create menu layer
  s_menu_layer = menu_layer_create(GRect(0, 0, PBL_DISPLAY_WIDTH, PBL_DISPLAY_HEIGHT));

  // Let it receive clicks
  menu_layer_set_click_config_onto_window(s_menu_layer, window);
  
  // Give it its callbacks
  MenuLayerCallbacks callbacks = {
    .draw_row = (MenuLayerDrawRowCallback) draw_row_callback,
    .get_num_rows = (MenuLayerGetNumberOfRowsInSectionsCallback) num_rows_callback,
    .select_click = (MenuLayerSelectCallback) select_click_callback
  };
  menu_layer_set_callbacks(s_menu_layer, NULL, callbacks);
  
  // Add layers to Window
  layer_add_child(window_get_root_layer(window), menu_layer_get_layer(s_menu_layer));
  layer_add_child(window_get_root_layer(window), text_layer_get_layer(s_text_layer));
  
  // Load any new settings for the menu
  refresh_menu();
}

static void main_window_unload(Window *window) {
  // Destroy MenuLayer
  menu_layer_destroy(s_menu_layer);
}

void inbox_init() {
  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(128, 128);
}

static void init() {
  // Create main Window element and assign to pointer
  s_main_window = window_create();

  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });

  // Show the Window on the watch, with animated=true
  window_stack_push(s_main_window, true);
  
  // Initialize the inbox for sending messages to / from phone
  inbox_init();
}

static void deinit() {
  // Destroy Window
  window_destroy(s_main_window);
  free(triggers);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
