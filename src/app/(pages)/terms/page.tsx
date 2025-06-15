import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - STI Race Connect',
  description: 'Read the terms and conditions for using STI Race Connect platform and services.',
};

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using STI Race Connect ("Platform", "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Permission is granted to temporarily use STI Race Connect for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Modify or copy the materials</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Use the materials for any commercial purpose or for any public display</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Attempt to reverse engineer any software contained on the platform</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Remove any copyright or other proprietary notations from the materials</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Account Registration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To access certain features of our platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Account Security</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Event Participation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Registration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By registering for events through our platform, you agree to comply with all event rules, regulations, and safety requirements as specified by the event organizers.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Race Results</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You acknowledge that race results, timing data, and rankings may be publicly displayed on our platform and shared with event organizers and other participants.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Assumption of Risk</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Participation in racing events involves inherent risks. You participate at your own risk and acknowledge that STI Race Connect is not responsible for any injuries or damages that may occur during events.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may not use our platform:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>For any unlawful purpose or to solicit others to perform unlawful acts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>To transmit false or misleading information</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Content</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content you submit and agree that:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>You will not submit content that is copyrighted, protected by trade secret or otherwise subject to third party proprietary rights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>You will not submit content that is false, defamatory, libelous, obscene, or invasive of another's privacy</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>You grant us a license to use, modify, and display your content in connection with our services</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the platform, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The information on this platform is provided on an 'as is' basis. To the fullest extent permitted by law, STI Race Connect excludes all representations, warranties, conditions and terms whether express or implied, statutory or otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitations</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall STI Race Connect or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform, even if STI Race Connect or its authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Accuracy of Materials</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials appearing on STI Race Connect could include technical, typographical, or photographic errors. STI Race Connect does not warrant that any of the materials on its platform are accurate, complete, or current.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                STI Race Connect may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Email: legal@stiraceconnect.com</p>
                <p className="text-foreground">Phone: +1 (555) 123-4567</p>
                <p className="text-foreground">Address: 123 Racing Avenue, Speed City, SC 12345</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 