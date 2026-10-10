import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MascotMood = 'happy' | 'cheering' | 'thinking' | 'worried' | 'celebrating' | 'sleeping';

@Component({
  selector: 'app-mascot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mascot-wrapper d-inline-flex flex-column align-items-center">
      <div class="mascot-avatar" [style.width.px]="size" [style.height.px]="size">
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Ears -->
          <circle cx="32" cy="36" r="14" fill="#8D5B4C"/>
          <circle cx="32" cy="36" r="8" fill="#F4A261"/>
          <circle cx="88" cy="36" r="14" fill="#8D5B4C"/>
          <circle cx="88" cy="36" r="8" fill="#F4A261"/>

          <!-- Body / Head -->
          <rect x="25" y="32" width="70" height="66" rx="28" fill="#A47148"/>

          <!-- Snout / Muzzle -->
          <ellipse cx="60" cy="74" rx="20" ry="15" fill="#E7C496"/>
          <!-- Nose -->
          <ellipse cx="60" cy="68" rx="6" ry="4" fill="#4A2810"/>

          <!-- Expression: Eyes & Mouth based on Mood -->
          @if (mood === 'celebrating' || mood === 'happy') {
            <!-- Joyful curved eyes -->
            <path d="M 42 54 Q 48 48 54 54" stroke="#2B1810" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <path d="M 66 54 Q 72 48 78 54" stroke="#2B1810" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <!-- Blushing cheeks -->
            <ellipse cx="36" cy="64" rx="6" ry="3.5" fill="#FF8A8A" opacity="0.6"/>
            <ellipse cx="84" cy="64" rx="6" ry="3.5" fill="#FF8A8A" opacity="0.6"/>
            <!-- Big smile -->
            <path d="M 54 75 Q 60 81 66 75" stroke="#4A2810" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            @if (mood === 'celebrating') {
              <!-- Party hat -->
              <polygon points="60,10 48,34 72,34" fill="#E76F51"/>
              <circle cx="60" cy="10" r="4" fill="#E9C46A"/>
            }
          } @else if (mood === 'cheering') {
            <!-- Round eager eyes with sparkles -->
            <circle cx="48" cy="52" r="5" fill="#2B1810"/>
            <circle cx="46" cy="50" r="1.8" fill="#FFFFFF"/>
            <circle cx="72" cy="52" r="5" fill="#2B1810"/>
            <circle cx="70" cy="50" r="1.8" fill="#FFFFFF"/>
            <ellipse cx="38" cy="64" rx="5" ry="3" fill="#FFAAA6" opacity="0.5"/>
            <ellipse cx="82" cy="64" rx="5" ry="3" fill="#FFAAA6" opacity="0.5"/>
            <!-- Open cheering mouth -->
            <path d="M 55 74 Q 60 82 65 74 Z" fill="#D94E34"/>
          } @else if (mood === 'thinking') {
            <!-- Thoughtful eyes looking up-right -->
            <circle cx="48" cy="51" r="4.5" fill="#2B1810"/>
            <circle cx="50" cy="49" r="1.5" fill="#FFFFFF"/>
            <circle cx="72" cy="51" r="4.5" fill="#2B1810"/>
            <circle cx="74" cy="49" r="1.5" fill="#FFFFFF"/>
            <!-- Curious slight mouth -->
            <path d="M 56 75 Q 60 77 64 75" stroke="#4A2810" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- Question mark hint or thought bubble -->
            <circle cx="86" cy="30" r="3" fill="#6C757D" opacity="0.7"/>
            <circle cx="94" cy="22" r="5" fill="#6C757D" opacity="0.7"/>
          } @else if (mood === 'worried') {
            <!-- Worried drooping eyebrows and round concerned eyes -->
            <path d="M 43 45 Q 49 48 53 47" stroke="#4A2810" stroke-width="2" stroke-linecap="round" fill="none"/>
            <path d="M 77 45 Q 71 48 67 47" stroke="#4A2810" stroke-width="2" stroke-linecap="round" fill="none"/>
            <circle cx="48" cy="53" r="4.5" fill="#2B1810"/>
            <circle cx="72" cy="53" r="4.5" fill="#2B1810"/>
            <!-- Slight sweat drop -->
            <path d="M 86 44 C 86 41 83 38 83 38 C 83 38 80 41 80 44 A 3 3 0 0 0 86 44 Z" fill="#4EA8DE"/>
            <!-- Wavy worried mouth -->
            <path d="M 54 77 Q 57 74 60 76 Q 63 78 66 75" stroke="#4A2810" stroke-width="2" stroke-linecap="round" fill="none"/>
          } @else if (mood === 'sleeping') {
            <!-- Sleeping closed eyes -->
            <path d="M 42 54 Q 48 57 54 54" stroke="#2B1810" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 66 54 Q 72 57 78 54" stroke="#2B1810" stroke-width="3" stroke-linecap="round" fill="none"/>
            <ellipse cx="60" cy="75" rx="3" ry="2" fill="#4A2810"/>
            <!-- Zzz text -->
            <text x="80" y="32" font-family="sans-serif" font-size="12" font-weight="bold" fill="#6C757D">Z</text>
            <text x="90" y="22" font-family="sans-serif" font-size="9" font-weight="bold" fill="#6C757D">z</text>
          } @else {
            <!-- Neutral / Friendly default eyes -->
            <circle cx="48" cy="53" r="4.5" fill="#2B1810"/>
            <circle cx="47" cy="51" r="1.5" fill="#FFFFFF"/>
            <circle cx="72" cy="53" r="4.5" fill="#2B1810"/>
            <circle cx="71" cy="51" r="1.5" fill="#FFFFFF"/>
            <path d="M 56 75 Q 60 78 64 75" stroke="#4A2810" stroke-width="2" stroke-linecap="round" fill="none"/>
          }
        </svg>
      </div>

      @if (speech) {
        <div class="mascot-speech shadow-sm mt-2 p-2 px-3 rounded-4 bg-white text-dark text-center border">
          <span class="speech-text">{{ speech }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .mascot-wrapper {
      transition: transform 0.2s ease;
    }
    .mascot-avatar {
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08));
    }
    .mascot-speech {
      max-width: 240px;
      font-size: 0.88rem;
      position: relative;
    }
    .mascot-speech::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 6px 6px 6px;
      border-style: solid;
      border-color: transparent transparent #dee2e6 transparent;
    }
  `]
})
export class MascotComponent {
  @Input() mood: MascotMood = 'happy';
  @Input() size = 80;
  @Input() speech = '';
}
