#include <pebble.h>

static Window *s_main_window;
static TextLayer *s_time_layer;

static void main_window_load(Window *window) {
  // Get information about the Window
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  // Create the TextLayer with specific bounds
  s_time_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(58, 52), bounds.size.w, 50));

  // Improve the layout to be more like a watchface
  text_layer_set_background_color(s_time_layer, GColorClear);
  text_layer_set_text_color(s_time_layer, GColorBlack);
  text_layer_set_text(s_time_layer, "00:00");
  text_layer_set_font(s_time_layer, fonts_get_system_font(FONT_KEY_BITHAM_42_BOLD));
  text_layer_set_text_alignment(s_time_layer, GTextAlignmentCenter);

  // Add it as a child layer to the Window's root layer
  layer_add_child(window_layer, text_layer_get_layer(s_time_layer));
}

static void main_window_unload(Window *window) {
  // Destroy TextLayer
  text_layer_destroy(s_time_layer);
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  // Read color preferences
  text_layer_set_text(s_time_layer, "00:00");

  // GColor bg_color = GColor_Black;
  // GColor fg_color = GColor_White;
  bool second_ticks = 0;
  bool animations = 0;

  Tuple *bg_color_t = dict_find(iter, MESSAGE_KEY_BackgroundColor);
  if(bg_color_t) {
    GColor bg_color = GColorFromHEX(bg_color_t->value->int32);
  }

  Tuple *fg_color_t = dict_find(iter, MESSAGE_KEY_ForegroundColor);
  if(fg_color_t) {
    GColor fg_color = GColorFromHEX(fg_color_t->value->int32);
  }

  Tuple *second_tick_t = dict_find(iter, MESSAGE_KEY_SecondTick);
  if(second_tick_t) {
    second_ticks = second_tick_t->value->int32 == 1;
    if (second_ticks) {
      text_layer_set_text(s_time_layer, "11:11");
    }
  }

  Tuple *animations_t = dict_find(iter, MESSAGE_KEY_Animations);
  if(animations_t) {
    animations = animations_t->value->int32 == 1;
    if (animations && second_ticks) {
      text_layer_set_text(s_time_layer, "33:33");
    } else if (animations) {
      text_layer_set_text(s_time_layer, "22:22");
    }
  }
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
